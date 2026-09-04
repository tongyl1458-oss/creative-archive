#!/usr/bin/env python3
"""HTTP server with Range request support for video/audio streaming."""

import http.server
import socketserver
import os
import sys
import urllib.parse

PORT = 9090
DIRECTORY = os.path.dirname(os.path.abspath(__file__))


class RangeHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """SimpleHTTPRequestHandler with HTTP Range request support."""

    def __init__(self, *args, **kwargs):
        kwargs['directory'] = DIRECTORY
        super().__init__(*args, **kwargs)

    def send_head(self):
        """Override to add Range request support."""
        path = self.translate_path(self.path)
        f = None

        if os.path.isdir(path):
            return super().send_head()

        try:
            f = open(path, 'rb')
        except OSError:
            self.send_error(404, "File not found")
            return None

        fs = os.fstat(f.fileno())
        file_size = fs[6]

        range_header = self.headers.get('Range')

        if range_header and range_header.startswith('bytes='):
            try:
                range_spec = range_header[6:]
                start_str, end_str = range_spec.split('-')

                if start_str:
                    start = int(start_str)
                else:
                    start = file_size - int(end_str) if end_str else 0

                if end_str:
                    end = min(int(end_str), file_size - 1)
                else:
                    end = file_size - 1

                if start > file_size - 1:
                    self.send_error(416, "Requested Range Not Satisfiable")
                    f.close()
                    return None

                content_length = end - start + 1

                self.send_response(206)
                self.send_header('Content-type', self.guess_type(path))
                self.send_header('Content-Range', f'bytes {start}-{end}/{file_size}')
                self.send_header('Content-Length', content_length)
                self.send_header('Accept-Ranges', 'bytes')
                self.send_header('Last-Modified', self.date_time_string(fs.st_mtime))
                self.end_headers()

                f.seek(start)
                return PartialFileWrapper(f, start, content_length)
            except (ValueError, IOError):
                f.close()
                self.send_error(400, "Bad Range Request")
                return None

        self.send_response(200)
        self.send_header('Content-type', self.guess_type(path))
        self.send_header('Content-Length', file_size)
        self.send_header('Accept-Ranges', 'bytes')
        self.send_header('Last-Modified', self.date_time_string(fs.st_mtime))
        self.end_headers()

        return f


class PartialFileWrapper:
    """File wrapper that sends only a portion of a file."""

    def __init__(self, fileobj, start, length):
        self.fileobj = fileobj
        self.remaining = length

    def read(self, size=-1):
        if self.remaining <= 0:
            return b''
        if size < 0 or size > self.remaining:
            size = self.remaining
        data = self.fileobj.read(size)
        self.remaining -= len(data)
        return data

    def close(self):
        self.fileobj.close()

    def __iter__(self):
        return self

    def __next__(self):
        chunk = self.read(64 * 1024)
        if not chunk:
            raise StopIteration
        return chunk


class ThreadedHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    """Threaded HTTP server for handling concurrent requests."""
    daemon_threads = True
    allow_reuse_address = True


if __name__ == '__main__':
    port = PORT if len(sys.argv) < 2 else int(sys.argv[1])
    handler = RangeHTTPRequestHandler
    httpd = ThreadedHTTPServer(('', port), handler)
    print(f"Range-enabled HTTP server running on port {port}")
    print(f"Serving directory: {DIRECTORY}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
        httpd.shutdown()

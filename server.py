from http.server import SimpleHTTPRequestHandler, HTTPServer
import json

class Handler(SimpleHTTPRequestHandler):
  def do_POST(self):
    if self.path == '/log':
      length = int(self.headers['Content-Length'])
      data = self.rfile.read(length)

      # TODO: format this properly.
      # right now, console.log("cowabunga", 5); would print:
      # JS LOG: ['cowabunga', 5]
      # whereas it should be:
      # "cowabunga 5"
      print("JS LOG:", json.loads(data))
      self.send_response(200)
      self.end_headers()

httpd = HTTPServer(('0.0.0.0', 8000), Handler)
print("Serving on port 8000...")
httpd.serve_forever()

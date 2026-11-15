import http.server
import socketserver
import webbrowser
import os
import sys

if sys.stdout.encoding != 'utf-8':
    try: sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError: pass

PORT = 8000

# كلاس لمنع المتصفح من تخزين أي شيء في الكاش
class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

os.chdir(os.path.dirname(os.path.abspath(__file__)))

def run_server():
    try:
        with socketserver.TCPServer(("", PORT), NoCacheHTTPRequestHandler) as httpd:
            print("="*60)
            print("تم تشغيل النظام بنجاح (بدون كاش)!")
            print(f"الرابط: http://localhost:{PORT}")
            print("="*60)
            webbrowser.open(f"http://localhost:{PORT}/login.html")
            httpd.serve_forever()
    except OSError:
        print(f"الخطأ: المنفذ {PORT} مستخدم بالفعل.")
    except KeyboardInterrupt:
        print("\nتم ايقاف التشغيل.")
        sys.exit(0)

if __name__ == "__main__":
    run_server()

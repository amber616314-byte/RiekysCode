#!/usr/bin/env python3
"""Serve the bundled static game using only Python's standard library."""

import argparse
import functools
import http.server
from pathlib import Path
import threading
import webbrowser


class GameHandler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".js": "text/javascript",
        ".css": "text/css",
    }


def main():
    parser = argparse.ArgumentParser(description="Start J-35 Bluewater Strike.")
    parser.add_argument("--port", type=int, default=8000)
    parser.add_argument("--lan", action="store_true", help="Allow devices on the local network.")
    parser.add_argument("--no-browser", action="store_true", help="Do not open a browser automatically.")
    args = parser.parse_args()
    if not 1 <= args.port <= 65535:
        parser.error("Port must be between 1 and 65535.")
    root = Path(__file__).resolve().parent / "dist"
    if not (root / "index.html").is_file():
        parser.error("The dist folder is missing. Keep it beside start_game.py.")
    host = "0.0.0.0" if args.lan else "127.0.0.1"
    handler = functools.partial(GameHandler, directory=str(root))
    try:
        server = http.server.ThreadingHTTPServer((host, args.port), handler)
    except OSError as exc:
        parser.exit(1, f"Unable to start server: {exc}\nTry another port with --port 8001.\n")
    url = f"http://localhost:{args.port}/"
    print(f"J-35 Bluewater Strike: {url}")
    if args.lan:
        print(f"Phone: open http://YOUR_COMPUTER_LAN_IP:{args.port}/ on the same Wi-Fi.")
    print("Press Ctrl+C to stop.")
    if not args.no_browser:
        threading.Timer(0.4, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()

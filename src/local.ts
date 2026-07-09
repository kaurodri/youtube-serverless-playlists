import handler from "../api/playlists";
import { config } from "./config";

const mockReq = {
  method: "GET",
  headers: { "x-api-key": config.apiKey },
} as any;

const mockRes = {
  _status: 200,
  _headers: {} as Record<string, string>,
  _body: null as any,
  setHeader(key: string, value: string) { this._headers[key] = value; return this; },
  status(code: number) { this._status = code; return this; },
  json(body: any) { this._body = body; return this; },
  end() { return this; },
} as any;

(async () => {
  await handler(mockReq, mockRes);
  console.log(`Status: ${mockRes._status}`);
  console.log(JSON.stringify(mockRes._body, null, 2));
})();

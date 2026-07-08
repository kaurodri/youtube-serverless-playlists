import { getPlaylists } from "./handler";
import { config } from "./config";

(async () => {
  const result = await getPlaylists(
    { headers: { "X-API-KEY": config.apiKey } } as any,
    {} as any,
    () => {}
  );
  console.log(JSON.stringify(JSON.parse((result as any).body), null, 2));
})();

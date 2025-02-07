# InEx

Share instagram videos with everyone.

This app doesn't store any video content. It works like this:

- You see a funny haha meme at `https://instagram.com/p/AbcAbc12345`
- You change the URL to `https://<wherever you host this app>/p/AbcAbc12345`
- the application fetches some metadata about the video, including the source URL on instagram's CDN
- It responds with a redirect to that source URL
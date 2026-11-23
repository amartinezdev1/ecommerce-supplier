interface CloudflareEnv { DB: D1Database; BUCKET: R2Bucket; }
declare namespace Cloudflare { interface Env extends CloudflareEnv {} }
declare module "*?raw" {const value:string;export default value;}

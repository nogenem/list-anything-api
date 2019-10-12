export default headers => {
  if (headers["x-forwarded-host"])
    return `${headers["x-forwarded-proto"]}://${headers["x-forwarded-host"]}`;

  if (headers.referer) {
    const host = headers.referer;
    const url = new URL(host);
    return url.origin;
  }

  let host = headers.host;
  if (!host.startsWith("http")) host = `http://${host}`;
  return host;
};

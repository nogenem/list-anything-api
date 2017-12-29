export default headers => {
  if (headers["x-forwarded-host"])
    return `${headers["x-forwarded-proto"]}://${headers["x-forwarded-host"]}`;

  if (headers.referer) {
    const host = headers.referer;
    const index = host.replace(/https?:\/\//, "").indexOf("/");
    return host.substring(0, index);
  }

  let host = headers.host;
  if (!host.startsWith("http")) host = `http://${host}`;
  return host;
};

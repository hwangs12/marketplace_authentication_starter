function authenticate(req: any, res: any, next: any) {
  // authorization token should be dynamic
  // token expiration date -> invalid once expired, user have to relogin to obtain the token
  if (req.header("Authorization") === "Basic c3VueW9uZ3Bhcms6MTIzNDU=") {
    next();
  } else {
    // next("You are not authorized");
    throw new Error("You are not authorized");
  }
}

export default authenticate;

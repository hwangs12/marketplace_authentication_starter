function authenticate(req: any, res: any, next: any) {
  console.log(req.header("Authorization"));
  if (req.header("Authorization") === "Basic c3VueW9uZ3Bhcms6MTIzNDU=") {
    next();
  } else {
    // next("You are not authorized");
    throw new Error("You are not authorized");
  }
}

export default authenticate;

export class Db {
  public static readonly url: string =
    "mongodb://root:rootpassword@localhost:27017/app?authSource=admin&readPreference=primary&ssl=false&directConnection=true";
}

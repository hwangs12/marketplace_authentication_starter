import bcrypt from "bcrypt";

bcrypt.hash("12341234", 8, (err, hash1) => {
  if (err) return console.log("Error occured");
  console.log(hash1);
  bcrypt.hash("12341234", 8, (err, hash2) => {
    if (err) return console.log("Error occured");
    console.log(hash2);

    bcrypt.compare("12341234", hash2, (err, isMatch) => {
      if (err) {
        console.log(err);
      }
      if (isMatch) {
        console.log("The passwords match");
      }
      console.log(isMatch);
    });
  });
});
// });

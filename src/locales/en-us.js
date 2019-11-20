module.exports = {
      "error": "Failure!",
      "register": {
            "emailerror": "Invalid email!",
            "usererror": "User has already been registered!",
            "email": {
                  "sub": "Welcome to Data Tongjì!",
                  "body": {
                        "text1": "Hello",
                        "text2": "your registration has been finished!",
                        "text3": "Thank you for joining us!",
                        "text4": "Read more about us!"
                  },
            },
      },
      "login": {
            "usererror": "User not found!",
            "invaliderror": "Invalid credentials!"
      },
      "forgotpass": {
            "mailerror": "Failed do send email!",
            "error": "Failed to change password!",
            "token":{
                  "error1": "Invalid token!",
                  "error2": "Expired token!"
            },
            "forgotemail": {
                  "sub": "Reset password!",
                  "body": {
                        "text1": "Hello",
                        "text2": "do you need to change your password?!",
                        "text3": "No problem! Use this token to confirm the change:"
                  },
            },
            "resetemail": {
                  "sub": "Password successfully changed!",
                  "body": {
                        "text1": "Hello",
                        "text2": "your password has been changed!",
                        "text3": "If you need anything else, feel free to contact us!",
                  },
            },
      },
      "userconfig": {
            "error": "Failed to refresh user configuration!",
            "saveconfigerror": "Failed to change user config"
      }
}
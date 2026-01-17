# Password Hasher (Mobile)

Every day we face the task of using passwords. Surely, the most convenient way for us is to use a single password for all resources. Unfortunately, such a strategy is too risky. The expert-recommended approach is to create an individual password for each resource. But how can you remember them all?

What if I told you that remembering just one phrase is enough to generate thousands of unique passwords?

When you need a password for a site, paste the site URL into the "Site tag" field, enter your secret phrase as the "Master key" (which remains private), and click the "Generate" button. The generated password will appear in the "Password" field and be copied to the clipboard. To recall the password later, simply repeat the process and you will get exactly the same password as before.

## How It Works

The most secure way to manage a password is to transform it into data that cannot be reversed to the original. This mechanism is known as hashing. This application generates a password for you using a strong, one-way hashing algorithm that produces a consistent result. For security, the app does not know your master key(s).

The project uses source code originally written by Steve Cooper: https://wijjo.com/passhash/

**P.S.** I am aware that there are other similar applications. However, many offer fewer options for customizing the generation algorithm. Furthermore, I have been using Steve's algorithm since the mid-2000s and prefer not to change all my existing passwords.

[iOS](https://apps.apple.com/us/app/password-hasher/id1565669128) | [Android](https://play.google.com/store/apps/details?id=ru.co_dev.passhash)

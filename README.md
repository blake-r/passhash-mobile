# Password Hasher (Mobile)

Everyday we face a task of using passwords. For sure, the most convenient way for us is to use a single password for all resources. Unfortunately, such strategy is too risky. A recommended by experts way is to create an individual password for each resource. But how to keep them all in mind?

What if I say that keeping only one phrase is enough to get thousands unique passwords?

When you need a password for a site, you paste a site URL into the "Site tag", then provide your secret phrase as the "Master key" which nobody sees, and finally click on the "Generate" button. A password for the site will appear in the "Password" field and also copied into the clipboard. When you need to recall the password, repeat this procedure and you'll get exactly the same password as was generated at the first time.

How it works.
The most secure way to store a password is to transform it into data that cannot be converted back to the original password. This mechanism is known as hashing. This application creates a password for you using a strong one-way hashing algorithm with a repeatable result. For security, it does not know your master key(s).

Project uses source code written by Steve Cooper: https://wijjo.com/passhash/

P.S. I know, there are other similar applications like this. First of all, they provide lesser abilities for adjusting generation algorithm. And secondly. I've been using Steve's algorithm since the middle of 2000s and wouldn't like to change all my passwords.

iOS: https://apps.apple.com/us/app/password-hasher/id1565669128
Android: https://play.google.com/store/apps/details?id=ru.co_dev.passhash

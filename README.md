# auxydize

**Auxydize allows you to store, manage, and use your Time-Based One-Time Password secrets on the command line.**

For SEO: This is basically Google Authenticator as a CLI.

<pre><font color="#55FF55"><b>➜  </b></font><font color="#55FFFF"><b>~</b></font> aux get
<u style="text-decoration-style:single">CODE</u>   <u style="text-decoration-style:single">ISSUER</u> <u style="text-decoration-style:single">NAME</u>                    <u style="text-decoration-style:single">LIFETIME</u>        
<font color="#FFFF55">123062</font> <b>Reddit</b> <b>testy@email-service.com</b> <font color="#55FF55">8s</font>       current
<font color="#FFFF55">012415</font> <b>Google</b> <b>TestyMcTesterton</b>        <font color="#55FF55">8s</font>       current
</pre>

## Installation

```sh
npm install -g auxydize-js
```

## Usage

Import secrets:

```
$ aux import --file ~/Desktop/google-authenticator-qr-code.png
[aux]# reddit successfully imported.
[aux]# Github:not-throwaway@email-service.com successfully imported.
```

Generate TOTPs to satisfy an authentication challenge:

```
$ aux get --alias reddit
CODE   ISSUER NAME                            LIFETIME
844777 Reddit not-throwaway@email-service.com 8s       current
```

View a secret's metadata:

```
$ aux details --alias reddit
KEY       VALUE
name      not-throwaway@email-service.com
issuer    Reddit
alias     reddit
algorithm sha1
digits    6
interval  30
tzero     0
secret    <masked>

Notes:
First Reddit account I ever made! Woo!
```

Add a secret manually:

```
$ aux set --alias second-reddit --name throwaway@email-service.com --issuer Reddit --secret "0f a3 9d bb 3e 10 18 7f 1c 94"
[aux]# second-reddit successfully inserted.
```

Edit a secret's metadata:

```
$ aux edit --alias reddit --newalias first-reddit --notes "Made a throwaway account, added 2FA to that, now I need to make sure I can distinguish them in my secret manager"
[aux]# Updated secret 'reddit'
```

Remove a secret:

```
$ aux rm --alias second-reddit
[aux]# Deleted secret with alias: second-reddit
```

List all secrets:

```
aux ls
ISSUER    : NAME                                 : ALIAS
Reddit    : not-throwaway@email-service.com      : first-reddit
Github    : not-throwaway@email-service.com      : Github:not-throwaway@email-service.com
```

Encrypt your local secrets database:

```
$ aux encrypt
[aux]# THIS COMMAND ENCRYPTS YOUR SECRETS DATABASE.
[aux]# IF YOU LOSE THE PASSWORD, THIS CANNOT BE UNDONE AND YOU WILL LOSE ALL SECRETS.
[aux]# Enter password to use for encryption (whitespace will be trimmed): *********
[aux]# Re-enter password: *********
[aux]# DB encrypted.
```

Decrypt your local secrets database:

```
$ aux decrypt
[aux]# Secrets database is encrypted.
[aux]# Please enter the database password: ****
[aux]# DB decrypted.
```

Export your secrets:

```
$ aux export -qg --filepath ~/Desktop/export-qr-to-scan-with-google-authenticator.png
[aux]# Successfully wrote QR code to /home/testymctesterton/Desktop/export-qr-to-scan-with-google-authenticator.png
```

## Contributing

Feel free to make PRs, but at this time I cannot commit to any level of responsiveness; your PR might sit unaddressed for a while, or forever.

## Problems?

[File an issue](https://github.com/imagodeo/auxydize-js/issues). Please [search existing issues](https://github.com/imagodeo/auxydize-js/issues?utf8=%E2%9C%93&q=is%3Aissue) first.

## TODO:

- Some kind of bundling/compile for bin install
- Update insert logic (stop inserting null/undefined)

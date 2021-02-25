# react-native-mnemonic_bip44-example

Setup:

Go to project directory.

`cd react-native-mnemonic_bip44-example`

Install rn-nodeify to be able to use Node.js libs.

`npm i rn-nodeify -g`

Install all dependencies.

`npm install`

Link required dependencies.

`react-native link react-native-randombytes`

Caution: 
If encounter unable to find sdk location on Mac.
Go to ./android/, create a local.properties file and config it as following.
Remember to change "UserName" to your own username.

`sdk.dir = /Users/"UserName"/Library/Android/sdk`

Run the app

`react-native run-android`

The app name is 'libTest'

# react-native-HDwallet-example

Setup:

Go to project directory.

`cd react-native-mnemonic_bip44-example`

Install all dependencies.

`npm install`

Install rn-nodeify to be able to use Node.js libs.

`npm i rn-nodeify -g`

Add this postinstall script to install & hack the Node.js libs for the usage in React Native.

`"postinstall": "rn-nodeify --install stream,buffer,events,assert,process,crypto --hack"`

Link required dependencies.

`react-native link react-native-randombytes`

Run the postinstall, it will create a shim.js file which you need to include in your index file.

`npm run postinstall`

Run the app

`react-native run-android`

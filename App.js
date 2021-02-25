import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Button,
  TextInput
} from 'react-native';

import {
  Colors
} from 'react-native/Libraries/NewAppScreen';

import './shim' // make sure to use es6 import and not require()
import Bitcoinjs from 'react-native-bitcoinjs';
import bip39 from 'react-native-bip39';
import { ethers } from 'ethers';
import eos from '@cobo/eos';

export default function App() {
  const [mnemonicPhrase, setPhrase] = useState("");
  const [passcode, setPasscode] = useState("");
  const [seed, setSeed] = useState(Buffer.from(''));
  const [seedHex, setSeedHex] = useState("");
  const [address, setAddress] = useState("");

  // Path
  const [coinIndex, setCoinIndex] = useState(0);
  const [account, setAccount] = useState(0);
  const [change, setChange] = useState(0);
  const [addressIndex, setAddressIndex] = useState(0);
  const [path, setPath] = useState(`m/44'/0'/0'/0/0`);

  async function createMnemonicPhrase(bits) {
    // Generate mnemonic code randomly
    const phrase = await bip39.generateMnemonic(bits);
    console.log(phrase);
    setPhrase(phrase);
  }

  async function generateSeed(phrase, passcode) {
    const phraseLength = phrase.trim().split(/\s+/g).length;
    // Check the phrase length
    if (phraseLength == 1) {
      alert("No mnemonic phrase is created.");
      return;
    } else if (phraseLength != 12 && phraseLength != 24) {
      alert("The length of the phrase does not match to 12 or 24.");
      return;
    }
    // Generate the seed with secured passcode
    const root = await bip39.mnemonicToSeed(phrase, passcode);
    await setSeed(root);
    setSeedHex(root.toString('hex'));
  }

  function modifyPath() {
    setPath(`m/44'/${coinIndex}'/${account}'/${change}/${addressIndex}`);
  }

  // Config the wallet for generating derived addresses
  async function setWallet() {
    if (seed == Buffer.from('')) {
      alert("Seed is empty.")
      return;
    }
    var wallet;
    // var coinIndex;
    switch (coinIndex) {
      case 0:
      case 200:
        wallet = await Bitcoinjs.bip32.fromSeed(seed);
        break;
      case 60:
        wallet = await ethers.utils.HDNode.fromSeed(seed);
        break;
      case 194:
        wallet = await eos.fromMasterSeed(seed);
        break;
    }
    generateAddress(wallet);
  }

  // Generate derived address
  async function generateAddress(wallet) {
    const key = wallet.derivePath(path);
    switch (coinIndex) {
      case 0:
      case 200:
        setAddress(await Bitcoinjs.payments.p2pkh({ pubkey: key.publicKey, network: Bitcoinjs.networks.bitcoin }).address);
        console.log(key.privateKey);
        break;
      case 60:
        setAddress(key.address);
        console.log(key.privateKey);
        break;
      case 194:
        setAddress(key.getPublicKey());
        console.log(key.getPrivateKey());
        break;
    }
  }

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          <View style={styles.body}>

            <Text style={styles.headTitle}>HD Wallet Example</Text>

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>First: Generate Mnemonic Phrase</Text>
              <View style={styles.buttonsOptions}>
                <Button
                  onPress={() => createMnemonicPhrase(128)}
                  title="12 words Phrase"
                />
                <Button
                  onPress={() => createMnemonicPhrase(256)}
                  title="24 words Phrase"
                />
              </View>
              <Text style={styles.title}>Phrase Generated:</Text>
              <Text>{mnemonicPhrase}</Text>
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Second: Enter Your Passcode</Text>
              <View>
                <TextInput
                  style={{ height: 40, borderColor: 'gray', borderWidth: 1, textAlign: 'center' }}
                  onChangeText={text => setPasscode(text)}
                />
              </View>
              <Text style={styles.title}>Passcode Entered:</Text>
              <Text style={{ textAlign: 'center' }}>{passcode}</Text>
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Third: Generate Seed</Text>
              <Button
                onPress={() => generateSeed(mnemonicPhrase, passcode)}
                title="Create Seed"
              />
              <Text style={styles.title}>Seed Generated in Hex:</Text>
              <Text>{seedHex}</Text>
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Fourth: Enter Derived Path</Text>
              <Text style={styles.title}>Choose the token address you want to generate.</Text>
              <View style={styles.buttonsOptions}>
                <Button
                  onPress={() => { setCoinIndex(0); setPath(`m/44'/0'/${account}'/${change}/${addressIndex}`); }}
                  title="BTC"
                />
                <Button
                  onPress={() => { setCoinIndex(60); setPath(`m/44'/60'/${account}'/${change}/${addressIndex}`); }}
                  title="ETH"
                />
                <Button
                  onPress={() => { setCoinIndex(194); setPath(`m/44'/194'/${account}'/${change}/${addressIndex}`); }}
                  title="EOS"
                />
                <Button
                  onPress={() => { setCoinIndex(200); setPath(`m/44'/200'/${account}'/${change}/${addressIndex}`); }}
                  title="OMNI"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.title}>Coin Index: </Text>
                <Text style={styles.title}>{coinIndex}</Text>
              </View>
              <View style={styles.inputContainer}>
                <Text>Account: (Any Integer)</Text>
                <TextInput
                  style={styles.textInput}
                  onChangeText={input => {setAccount(input); setPath(`m/44'/${coinIndex}'/${input}'/${change}/${addressIndex}`); }}
                  keyboardType='numeric'
                />
              </View>
              <View style={styles.inputContainer}>
                <Text>External / Internal: (0/1)</Text>
                <TextInput
                  style={styles.textInput}
                  onChangeText={input => {setChange(input); setPath(`m/44'/${coinIndex}'/${account}'/${input}/${addressIndex}`); }}
                  keyboardType='numeric'
                />
              </View>
              <View style={styles.inputContainer}>
                <Text>Address Index: (Any Integer)</Text>
                <TextInput
                  style={styles.textInput}
                  onChangeText={input => {setAddressIndex(input); setPath(`m/44'/${coinIndex}'/${account}'/${change}/${input}`); }}
                  keyboardType='numeric'
                />
              </View>
              <Text style={styles.title}>Path:</Text>
              <Text style={styles.title}>{path}</Text>
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Fifth: Generate Address</Text>
              <View style={styles.buttonsOptions}>
                <Button
                  onPress={() => setWallet()}
                  title="Generate Address"
                />
              </View>
              <Text style={styles.title}>Address Generated:</Text>
              <Text style={styles.title}>{address}</Text>
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  buttonsOptions: {
    flexDirection: 'row',
    justifyContent: 'space-evenly'
  },
  headTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 24
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16
  },
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  body: {
    backgroundColor: Colors.white,
    flex: 1,
    justifyContent: 'center'
  },
  sectionContainer: {
    margin: 10,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
    textAlign: 'center'
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  textInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    textAlign: 'center',
    flex: 1,
    margin: 5
  }
});


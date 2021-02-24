/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

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
  
  // Config the wallet for generating derived addresses
  async function setWallet(coinType, addressIndex) {
    if (seed == Buffer.from('')) {
      alert("Seed is empty.")
      return;
    }
    var wallet;
    var coinIndex;
    switch (coinType) {
      case "BTC":
      case "OMNI":
        wallet = await Bitcoinjs.bip32.fromSeed(seed);
        console.log(wallet);
        switch (coinType) {
          case "BTC":
            coinIndex = 0;
            break;
          case "OMNI":
            coinIndex = 200;
            break;
        }
        break;
      case "ETH":
        wallet = await ethers.utils.HDNode.fromSeed(seed);
        coinIndex = 60;
        break;
      case "EOS":
        wallet = await eos.fromMasterSeed(seed);
        coinIndex = 194;
        break;
    }
    const path = `m/44'/${coinIndex}'/0'/0/${addressIndex}`
    generateAddress(coinType, wallet, path);
  }

  // Generate derived address
  async function generateAddress(coinType, wallet, path) {
    const key = wallet.derivePath(path);
    switch (coinType) {
      case "BTC":
      case "OMNI":
        setAddress(await Bitcoinjs.payments.p2pkh({ pubkey: key.publicKey, network: Bitcoinjs.networks.bitcoin }).address);
        break;
      case "ETH":
        setAddress(key.address);
        break;
      case "EOS":
        setAddress(key.getPublicKey());
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
                  style={{ height: 40, borderColor: 'gray', borderWidth: 1, textAlign: 'center'}}
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
              <Text style={styles.sectionTitle}>Fourth: Generate Address</Text>
              <View style={styles.buttonsOptions}>
                <Button
                  onPress={() => setWallet("BTC", 0)}
                  title="BTC"
                />
                <Button
                  onPress={() => setWallet("ETH", 0)}
                  title="ETH"
                />
                <Button
                  onPress={() => setWallet("EOS", 0)}
                  title="EOS"
                />
                <Button
                  onPress={() => setWallet("OMNI", 0)}
                  title="OMNI"
                />
              </View>
              <Text style={styles.title}>Address Generated:</Text>
              <Text>{address}</Text>
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
  }
});


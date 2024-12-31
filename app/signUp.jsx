import React, { useRef, useState, useEffect } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import { StatusBar } from 'expo-status-bar';
import BackButton from '../components/BackButton';
import { useRouter } from 'expo-router';
import Icon from '../assets/icons/index';
import { wp, hp } from '../helpers/common';
import Input from '../components/Input';
import Button from '../components/Button';
import { supabase } from '../lib/supabase';
import { useAuthRequest, makeRedirectUri } from 'expo-auth-session';
import { theme } from '../constants/theme';
import { GoogleClientId } from '../constants/index';
import * as webBrowser from "expo-web-browser"
import * as Google from "expo-auth-session/providers/google"
import AsyncStorage from "@react-native-async-storage/async-storage"



const SignUp = () => {
  const router = useRouter();
  const emailRef = useRef('');
  const nameRef = useRef('');
  const passwordRef = useRef('');
  const [loading, setLoading] = useState(false);

  // Set up Google OAuth using expo-auth-session
  const [request, response, promptAsync] = useAuthRequest({
    clientId: GoogleClientId,  // Your Supabase anon key
    redirectUri: makeRedirectUri({ native:'myapp',useProxy: true }),  // Expo redirect URI
    scopes: ['profile', 'email'],
  }, {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth'
  });

  // Function to handle form submission (email/password)
  const onSubmit = async () => {
    if (!emailRef.current || !passwordRef.current) {
      Alert.alert('SignUp', "Please fill all the fields🥺!");
      return;
    }

    let name = nameRef.current.trim();
    let email = emailRef.current.trim();
    let password = passwordRef.current.trim();

    setLoading(true);
    const { data: { session }, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, email },
      },
    });
    setLoading(false);

    if (error) {
      Alert.alert('Sign up', error.message);
    }
  };

  // Handle Google Sign-In response
  useEffect(() => {
    const handleGoogleSignIn = async () => {
      if (response?.type === 'success') {
        const { id_token } = response.params;

        // Sign in with the Google OAuth token in Supabase
        const { user, session, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          token: id_token,
        });

        if (error) {
          Alert.alert('Google Sign-In Error', error.message);
        } else {
          console.log('Google Sign-In Success:', user);
          router.push('home');  // Redirect to the home screen
        }
      }
    };

    handleGoogleSignIn();
  }, [response]);

  return (
    <ScreenWrapper bg={"white"}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <BackButton router={router} />
        <View>
          <Text style={styles.welcomeText}>Hey Buddy, </Text>
          <Text style={styles.welcomeText}>Let's Get Started</Text>
        </View>
        <View style={styles.form}>
          <Text style={{ fontSize: hp(1.5), color: theme.colors.text }}>
            Enter your details below to create a new account and join us!🎉
          </Text>

          <Input
            icon={<Icon name="mail" size={26} strokeWidth={1.6} />}
            placeholder="Enter your email"
            onChangeText={(value) => (emailRef.current = value)}
          />
          <Input
            icon={<Icon name="user" size={26} strokeWidth={1.6} />}
            placeholder="Enter your name"
            onChangeText={(value) => (nameRef.current = value)}
          />
          <Input
            icon={<Icon name="lock" size={26} strokeWidth={1.6} />}
            placeholder="Enter your password"
            secureTextEntry
            onChangeText={(value) => (passwordRef.current = value)}
          />

          <Button title={'Sign Up'} loading={loading} onPress={onSubmit} />
          <Button title="Sign Up with Google" onPress={promptAsync} loading={loading} />
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account!</Text>
          <Pressable onPress={() => router.push('login')}>
            <Text style={[styles.footerText, { color: theme.colors.primaryDark, fontWeight: theme.fonts.semibold }]}>
              Login
            </Text>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 45,
    paddingHorizontal: wp(5),
  },
  welcomeText: {
    fontSize: hp(5),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  form: {
    gap: 25,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  footerText: {
    textAlign: 'center',
    color: theme.colors.text,
    fontSize: hp(1.6),
  },
});

export default SignUp;

"use client";

import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { FCM } from '@capacitor-community/fcm';

export const usePushNotifications = () => {
  const [fcmToken, setFcmToken] = useState(null);

  useEffect(() => {
    // We only want to execute this if we're running inside the native Capacitor app
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const registerPushNotifications = async () => {
      // Request permission to use push notifications
      // iOS will prompt user and return if they granted permission or not
      // Android will just grant without prompting
      const permStatus = await PushNotifications.requestPermissions();

      if (permStatus.receive === 'granted') {
        // Register with Apple / Google to receive push via APNS/FCM
        await PushNotifications.register();
      } else {
        console.warn('Push notification permission denied');
      }
    };

    // On success, we should be able to receive notifications
    const addListeners = async () => {
      await PushNotifications.addListener('registration', token => {
        console.log('Push registration success, token: ' + token.value);
        setFcmToken(token.value);
        
        // Subscribe to FCM topic
        FCM.subscribeTo({ topic: "all" })
          .then(() => console.log('Subscribed to topic: all'))
          .catch((err) => console.log('Error subscribing to topic', err));
      });

      await PushNotifications.addListener('registrationError', err => {
        console.error('Push registration error: ', err.error);
      });

      await PushNotifications.addListener('pushNotificationReceived', notification => {
        console.log('Push received: ', notification);
        // You can display an in-app alert or banner here if the app is open
      });

      await PushNotifications.addListener('pushNotificationActionPerformed', notification => {
        console.log('Push action performed: ', notification);
        // Navigate the user to a specific page when they click the notification
        // For example, if the payload has a URL or post ID
        const data = notification.notification.data;
        if (data && data.url) {
          window.location.href = data.url;
        }
      });
    };

    registerPushNotifications();
    addListeners();

    return () => {
      if (Capacitor.isNativePlatform()) {
        PushNotifications.removeAllListeners();
      }
    };
  }, []);

  return { fcmToken };
};

"use client";
import { firestore }from "../../firebase/config"
import { addDoc,collection,onSnapshot } from "firebase/firestore"
import {app} from "../../firebase/config"
import { getFunctions, httpsCallable } from "firebase/functions";

export const getCheckoutUrl = async (priceId, currentUserId) => {
    if (!currentUserId) throw new Error("User is not authenticated");
    const checkoutSessionRef = collection(
        firestore,
        "customers",
        currentUserId,
        "checkout_sessions"
      );
    const docRef = await addDoc(checkoutSessionRef,{
        price:priceId,
        success_url: window.location.origin,
        cancel_url: window.location.origin,
    })

    return new Promise((resolve, reject) => {
        const unsubscribe = onSnapshot(docRef, (snap) => {
            const {error, url} = snap.data() || {}
            if(error){
                unsubscribe()
                reject(new Error(`An error occured ${error.message}`))
            }
            if(url){
                console.log("Stripe Checkout URL:", url);
                unsubscribe();
                resolve(url);
            }
        })
    })
}

export const getPortalUrl = async (user) => {
    const userId = user?.currentUse?.id;
  
    let dataWithUrl;
    try {
      const functions = getFunctions(app, "us-east1");
      const functionRef = httpsCallable(
        functions,
        "ext-firestore-stripe-payments-createPortalLink"
      );
      const { data } = await functionRef({
        customerId: userId,
        returnUrl: window.location.origin,
      });
  
      dataWithUrl = data;
      console.log("Reroute to Stripe portal: ", dataWithUrl.url);
    } catch (error) {
      console.error(error);
    }
  
    return new Promise((resolve, reject) => {
      if (dataWithUrl && dataWithUrl.url) {
        resolve(dataWithUrl.url);
      } else {
        reject(new Error("No url returned"));
      }
    });
  };

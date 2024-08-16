"use client";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { firestore } from "../../firebase/config";

export const getPremiumStatus = async (user) => {
  const userId = user.currentUser?.id;
  if (!userId) throw new Error("User not logged in");

  const subscriptionsRef = collection(firestore, "customers", userId, "subscriptions");
  const q = query(
    subscriptionsRef,
    where("status", "in", ["trialing", "active"])
  );

  return new Promise((resolve, reject) => {
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.docs.length === 0) {
          resolve(false);
        } else {
          resolve(true);
        }
        unsubscribe();
      },
      (error) => {
        reject(error);
      }
    );
  });
};

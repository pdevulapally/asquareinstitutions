import { User } from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export interface UserData {
  email: string;
  isAdmin: boolean;
  name?: string;
  createdAt?: string | any;
  updatedAt?: string | any;
}

export async function checkAdminStatus(user: User | null): Promise<boolean> {
  if (!user || !db) {
    return false;
  }

  try {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.isAdmin === true;
    }

    return false;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

export async function getUserData(user: User | null): Promise<UserData | null> {
  if (!user || !db) {
    return null;
  }

  try {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    }

    return null;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
}

/**
 * Creates or updates a user document in Firestore
 * Creates document for all authenticated users (not just admins)
 * This allows admins to see and manage all users
 */
export async function createOrUpdateUser(user: User | null): Promise<void> {
  if (!user || !db) {
    return;
  }

  try {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      // Update existing user document
      const userData = userDoc.data();
      const updateData: Partial<UserData> = {
        email: user.email || userData.email || "",
        name: user.displayName || userData.name || undefined,
        // Preserve admin status if it exists
        isAdmin: userData.isAdmin || false,
      };
      await setDoc(userDocRef, updateData, { merge: true });
    } else {
      // Create new user document
      const newUserData: any = {
        email: user.email || "",
        isAdmin: false, // Default to non-admin
        name: user.displayName || undefined,
        createdAt: serverTimestamp(),
      };
      await setDoc(userDocRef, newUserData);
    }
  } catch (error) {
    console.error("Error creating/updating user document:", error);
    throw error;
  }
}

/**
 * Updates an existing admin user document in Firestore
 * Only updates if user document exists and is an admin
 * Does NOT create new user documents - only admins can login
 * @deprecated Use createOrUpdateUser instead for managing all users
 */
export async function updateAdminUser(user: User | null): Promise<void> {
  if (!user || !db) {
    return;
  }

  try {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    // Only update if user document exists and is admin
    if (userDoc.exists()) {
      const userData = userDoc.data();
      // Only update admin users
      if (userData.isAdmin === true) {
        const updateData: Partial<UserData> = {
          email: user.email || userData.email || "",
          name: user.displayName || userData.name || undefined,
          // Preserve admin status
          isAdmin: true,
        };

        // Use merge to preserve existing fields like createdAt
        await setDoc(userDocRef, updateData, { merge: true });
      }
    }
    // If user doesn't exist, do nothing - they can't login
  } catch (error) {
    console.error("Error updating admin user document:", error);
    throw error;
  }
}

/**
 * Checks if an email belongs to an admin user
 * This is used for forgot password functionality
 */
export async function isAdminEmail(email: string): Promise<boolean> {
  if (!email || !db) {
    return false;
  }

  try {
    // Query users collection by email field
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return false;
    }

    // Check if any user with this email is an admin
    for (const docSnapshot of querySnapshot.docs) {
      const userData = docSnapshot.data();
      if (userData.isAdmin === true) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("Error checking admin email:", error);
    return false;
  }
}


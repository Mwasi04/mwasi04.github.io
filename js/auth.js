import { auth, db } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    FacebookAuthProvider,
    sendPasswordResetEmail 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    doc, 
    setDoc, 
    getDoc,
    collection,
    query,
    where,
    getDocs 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Check if user is admin
export async function isUserAdmin(userId) {
    try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        return userSnap.exists() && userSnap.data().role === 'admin';
    } catch (error) {
        console.error("Error checking admin status:", error);
        return false;
    }
}

// Sign up new user
export async function signUpUser(email, password, userData) {
    try {
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Store additional user data in Firestore
        await setDoc(doc(db, "users", user.uid), {
            ...userData,
            email: email,
            role: 'user',
            createdAt: new Date().toISOString(),
            cart: [],
            addresses: []
        });
        
        return { success: true, user };
    } catch (error) {
        console.error("Signup error:", error);
        return { success: false, error: error.message };
    }
}

// Sign in user
export async function signInUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error("Signin error:", error);
        return { success: false, error: error.message };
    }
}

// Sign in with Google
export async function signInWithGoogle() {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        // Check if user exists in Firestore, if not create record
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
            await setDoc(userRef, {
                name: user.displayName || 'User',
                firstName: user.displayName?.split(' ')[0] || '',
                lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
                email: user.email,
                phone: user.phoneNumber || '',
                role: 'user',
                createdAt: new Date().toISOString(),
                cart: [],
                addresses: []
            });
        }
        
        return { success: true, user };
    } catch (error) {
        console.error("Google signin error:", error);
        return { success: false, error: error.message };
    }
}

// Sign in with Facebook
export async function signInWithFacebook() {
    try {
        const provider = new FacebookAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        // Check if user exists in Firestore, if not create record
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
            await setDoc(userRef, {
                name: user.displayName || 'User',
                firstName: user.displayName?.split(' ')[0] || '',
                lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
                email: user.email,
                phone: user.phoneNumber || '',
                role: 'user',
                createdAt: new Date().toISOString(),
                cart: [],
                addresses: []
            });
        }
        
        return { success: true, user };
    } catch (error) {
        console.error("Facebook signin error:", error);
        return { success: false, error: error.message };
    }
}

// Sign out user
export async function signOutUser() {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        console.error("Signout error:", error);
        return { success: false, error: error.message };
    }
}

// Reset password
export async function resetPassword(email) {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error) {
        console.error("Password reset error:", error);
        return { success: false, error: error.message };
    }
}

// Get current user data from Firestore
export async function getCurrentUserData(uid) {
    try {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        return userSnap.exists() ? userSnap.data() : null;
    } catch (error) {
        console.error("Error getting user data:", error);
        return null;
    }
}

// Auth state observer
export function observeAuthState(callback) {
    return onAuthStateChanged(auth, callback);
}

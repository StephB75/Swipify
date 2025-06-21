import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient"; // import your Supabase client
import { Auth } from "@supabase/auth-ui-react"; // import Supabase Auth UI component
import { ThemeSupa } from "@supabase/auth-ui-shared"; // import Supabase UI theme
import { Link } from "react-router-dom"; // import router link to navigate between pages

function App() {
  // Store the current session (null by default before login)
  const [session, setSession] = useState<any>(null);

  // This runs once when the component mounts
  useEffect(() => {
    // Get the current session (in case user is already logged in)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session); // update the state with the session info
      if (session) {
        console.log("User ID:", session.user.id); // log user ID if already logged in
      }
    });

    // Listen for any changes to auth state (login, logout, refresh, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session); // update session state whenever auth state changes
      if (session) {
        console.log("User ID:", session.user.id); // log user ID when auth state changes (ex: after login)
      }
    });

    // Cleanup function: unsubscribe when component unmounts
    return () => subscription.unsubscribe();
  }, []);

  // If no session (user not logged in), show the login form
  if (!session) {
    return (
      <div className="App">
        {/* Render Supabase Auth UI */}
        <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
      </div>
    );
  }
  // If session exists (user is logged in), show logged-in content
  else {
    return (
      <div className="App">
        <h1>Welcome! You are logged in.</h1>

        {/* Display the user ID */}
        <p>User ID: {session.user.id}</p>

        {/* Link to navigate to Gallery page */}
        <Link to="/gallery">Go to Gallery</Link>

        <br />

        {/* Sign out button */}
        <button onClick={() => supabase.auth.signOut()}>Sign Out</button>
      </div>
    );
  }
}

export default App;

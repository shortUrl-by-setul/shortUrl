# URL Shortener and QR Code Generator

## Project Overview 📝

This project is designed to provide users with a simple yet powerful tool for shortening URLs and generating QR codes, with **a strong emphasis on security**. The primary focus is the URL shortener, which allows users to convert lengthy web links into concise, manageable URLs. This tool incorporates essential features such as **form validation, authentication, authorization, and access control policies**, ensuring a seamless and **secure** experience across various devices and browsers.

Beyond URL shortening, this project includes a **QR code generator**, enabling users to quickly create QR codes for easy sharing of web links. Whether for marketing, documentation, or personal use, this feature enhances accessibility and usability while ensuring data integrity.

## Project Showcase and Demo 🚀📷

Here’s a quick demo of the project in action:

- A user inputs a long URL into the form.
- The application validates the input, which is accessible across browsers.
- The backend generates a shortened URL using an authenticated request and stores it in the database.
- The user can copy the short URL for easy sharing.
- QR Code generation is handled client-side
- Account settings are handled via the backend
- Real-time updates allow users to view saved links and codes dynamically.

## Main Features

- **Form Validation & Input Sanitization:** Ensures user input is correctly formatted and secure before processing.
- **Native/Cross-Browser Compatibility:** Works smoothly across different web browsers and devices.
- **Accessibility:** Implements best practices to ensure usability for all users, including those with disabilities.
- **Long URL to Short URL Conversion:** Transforms lengthy URLs into short, user-friendly versions.
- **Backend Database & Security Policies:** Implements strict policies that govern access control, authentication, and user role management.
- **API Integration:** Provides a secure interface for developers to generate short URLs programmatically.
- **Secure User Profile Management:** Allows authenticated users to safely update profile details such as **email, password, and handle** while ensuring validation checks.
- **Expiration and Cleanup:** Links have expiration dates (customizable) and a cron job ensure database stays clean.

## Security Enhancements 🔒

This project incorporates several security best practices to safeguard user data and enforce strict control over database operations:

- **Authentication System:** Users must be authenticated before performing key actions.
- **Authorization & Role-Based Access Control:** Users are assigned roles, ensuring only authorized individuals can execute specific functions.
- **Origin Validation:** All backend requests enforce origin verification to ensure they originate from `setulp.com`.
- **Input Validation & Sanitization:** All user inputs are **validated and sanitized** to prevent injection attacks.
- **Database Security Policies:** The database itself enforces strict security policies to restrict modification privileges to backend functions only, ensuring no unauthorized access or data tampering.
- **Secure Profile Updates:** Users can update sensitive profile information through a **protected** backend system that verifies identity before allowing changes.
- **Row-Level Security (RLS) Policies:** Ensures users can only access permitted data, preventing unauthorized reads or writes.
- **Supabase Edge Functions with Server-Side Validation:** Backend logic is executed through secure **serverless functions**, validating data before committing changes to the database.

## Technologies Used 💻

This project utilizes modern web technologies and backend solutions to deliver reliable performance and **high security**:

- **Supabase Postgres SQL:** A powerful relational database with built-in security features.
- **Database Functions:** Implements logic to process and manage URL shortening while enforcing security measures.
- **Database Triggers:** Automates secure operations when changes occur in the database.
- **Supabase Edge Functions:** Serverless functions that enhance backend security without extra overhead.
- **Realtime Database:** Allows dynamic updates while enforcing access control.
- **Row-Level Security (RLS) Policies:** Strengthens data security by ensuring users can only access permitted information.
- **Server-Side Validation & Authentication:** Ensures data integrity and prevents unauthorized access.
- **Client-Side Validation:** Provides immediate feedback to users while complementing backend validation.
- **React:** A modern JavaScript library used for building an interactive front-end interface.
- Git
- GitHub Pages

## What I Learned 🧠💡

Through this project, I gained valuable experience in backend development, **security enforcement**, database management, and front-end integration. I learned:

- The importance of **strong authentication** for protecting sensitive operations.
- How to implement **secure user role management** to restrict unauthorized actions.
- Best practices for **backend security policies** that complement database security.
- The power of **serverless functions** for executing controlled backend logic.
- How **real-time databases** enhance data integrity and prevent unauthorized modifications.
- The significance of **origin validation** for enforcing secure API interactions.
- How **React** contributes to a seamless and interactive user experience.

This project strengthened my ability to develop **full-stack applications** with a focus on **security, accessibility, and performance**.

## 🚀💻 Development Flow:

### Step 1: Project Setup and Structure

- Initialize the project using a package manager like **npm** or **yarn**.
- Set up a **React** project with necessary dependencies (e.g., React Router, Supabase client).
- Configure the **file structure** for components, utils, and services.

### Step 2: Create the UI (Shortened URL, QR Code, Login, Saved Drawer Components)

- Design a **responsive UI** using CSS frameworks or utility classes.
- Design an **accessible form** with validation for URL input.
- Implement **client-side validation** to ensure correct format before sending data.
- Add an **error handling system** for user feedback.
- Implement components:
    - **Shortened URL Display** with copy functionality.
    - **QR Code Generator** to convert user input into a shareable QR code.
    - **Login Drawer** for authentication and account activities.
    - **Saved Drawer** to store and display previously shortened URLs.
    - Use **CSS Modules** or Styled Components for styling.
    - Improve **accessibility** with proper color contrasts and ARIA attributes.

### Step 3: Setting up the Database Tables

Define **public** schema with the following tables:

- `links` (stores original & shortened URLs).
    - id: text
    - created_at: timestampz
    - expires_at: timestampz
    - author: uuid (foreign key w/ CASCADE to `public.profiles.id`)
    - long_url: text
    - times_visited: int4
- `profiles` (user data).
    - id: uuid (foreign key w/ CASCADE to `auth.users.id`)
    - email: text
    - public: boolean
    - qrcodes: jsonb
    - handle: text
- `deleted_links` (logs removed URLs).
- `user_roles` (role of each user).

Certain columns (e.g. links.id, links.long_url, profiles.handle, etc.) have constraints put on them.
Even though inserting new rows already had client and server-side validation, constraints are there as a last defense to ensure minimal nefarious activities and increase security.

### Step 4: Setting up Realtime Data

- **Enable Realtime** to sync user interactions instantly via a listener.

### Step 5: Setting up Table Policies (RLS)

- Apply **Row-Level Security (RLS)** to restrict unauthorized access.
- Define **access policies** for each table (e.g., only owners can delete their links).
- The `profiles` table requires the most extensive policy. It needs a **SELECT** policy that allows anyone to view public profiles, users can view their own profiles, and admin roles can view anyone's profile. It also needs an **UPDATE** policy that allows the user to update their own data, but they cannot change their profile to public unless their role is of “vip” or "admin”. It must also allow admins to update anyone's data. This means both policies are applied to the `authenticated` schema.
    
    ```pgsql
    alter policy "User can update some of their own data and admins can update an"
    on "public"."profiles"
    to authenticated
    using (
    (
    	((SELECT user_roles.role FROM user_roles
    		WHERE (user_roles.id = ( SELECT auth.uid() AS uid))
    	) = 'admin'::text )
    	OR
    	(id = ( SELECT auth.uid() AS uid)
    ))
    with check (
      (
    	  ((SELECT user_roles.role FROM user_roles
    		  WHERE (user_roles.id = ( SELECT auth.uid() AS uid))
    		) = 'admin'::text )
    	  OR
    	  (
    		  (id = ( SELECT auth.uid() AS uid))
    		  AND
    		  (
    			  (public = false)
    			  OR
    			  (
    				  ((SELECT user_roles.role FROM user_roles
    					  WHERE (user_roles.id = ( SELECT auth.uid() AS uid))
    					) = 'vip'::text )
    			  OR
    				  ((SELECT user_roles.role FROM user_roles
    					  WHERE (user_roles.id = ( SELECT auth.uid() AS uid))
    					) = 'admin'::text )
    				)
    			)
    		)
    	)
    );
    ```
    
- The `deleted_links` table requires a policy for both **INSERT** and **SELECT** that allows authenticated users to only view and add their own data (when they delete a link, auto add via `before_delete_link` trigger and `log_deleted_link` function). This means both policies are applied to the `authenticated` schema.
    
    ```pgsql
    author = ( SELECT auth.uid() AS uid )
    ```
    
- The `links` table requires a policy for **SELECT** and **DELETE** that allows anyone to view, but only authenticated users can delete their own links. The **SELECT** policy is applied to the `public` schema, while the **DELETE** policy is applied to the `authenticated` schema.
    
    ```pgsql
    # SELECT
    true
    # DELETE
    author = ( SELECT auth.uid() AS uid )
    ```
    
- The `user_roles` table requires a policy for both **SELECT** and **UPDATE** that allows admins to update anyone’s role and allows users to view their own role. This means both policies are applied to the `authenticated` schema.
    
    ```pgsql
    # SELECT
    id = ( SELECT auth.uid() AS uid )
    # UPDATE
    (
    	SELECT user_roles_1.role FROM user_roles user_roles_1
    	WHERE (user_roles_1.id = ( SELECT auth.uid() AS uid) )
    ) = 'admin'::text
    ```
    

### Step 6: Setting up Database Functions

To handle complex database operations and ensure data consistency, we need to establish a series of carefully designed database functions. These functions will manage various aspects of our database functionality, including automated table maintenance, user account management, logging operations, and maintaining data integrity across different tables. Each function serves a specific purpose in our database architecture and works in conjunction with our security policies.

| Name | Arguments | Return type | Security |
| --- | --- | --- | --- |
| cleanup_tables | - | void | Invoker |
| delete_my_account | - | void | Definer |
| log_deleted_link | - | trigger | Invoker |
| setup_profile_on_signup | - | trigger | Definer |
| setup_role_on_new_profile | - | trigger | Definer |
| update_email_columns_on_user_email_update | - | trigger | Definer |
| update_profile_on_role_change | - | trigger | Definer |

The `cleanup_tables` function is for the cron job that runs every day at midnight UTC. It checks for and deletes expired links, and deletes links older than 1 day in `deleted_links` table.

The `delete_my_account` function can be run via the API and deletes the account of the user running the function.

The `log_deleted_link` function creates a new entry in the deleted_links table when a link is deleted. Run by a trigger BEFORE DELETE on `deleted_links`.

The `setup_profile_on_signup` function creates a new row in the profiles table with information in `auth.users` table. This includes the linked foreign key id, email, and user role. Run by trigger AFTER INSERT on `auth.users` table.

The `setup_role_on_new_profile` function creates a new row for a new profile being created and sets the role to null (aka member). Run by trigger AFTER INSERT on `public.profiles`.

The `update_email_columns_on_user_email_update` updates the column called “email” in profiles and user_roles if it was changed. Run by a trigger AFTER UPDATE on `auth.users`.

The `update_profile_on_role_change` will update the “public” column if applicable and will update the role displayed in the user’s data. This role column is used by admins purely to see user roles.

### Step 7: Setting up Database Triggers

Now that we have our database function, lets setup the triggers so that they can effectively work together. The following triggers need to be set up: three in the public schema and two in the auth schema. They will run the functions previously defined to ensure automatic, consistent, and secure updates across our database.

| Name | Table | Function | Events | Orientation |
| --- | --- | --- | --- | --- |
| after_new_profile | public.profiles | setup_role_on_new_profile | AFTER INSERT | ROW |
| after_role_change | public.user_roles | update_profile_on_role_change | AFTER UPDATE | ROW |
| before_delete_link | public.links | log_deleted_link | BEFORE DELETE | ROW |
| after_user_signup | auth.users | setup_profile_on_signup | AFTER INSERT | ROW |
| on_update_user_email_trigger | auth.users | update_email_columns_on_user_email_update | AFTER UPDATE | ROW |

### Step 8: Creating Serverless Functions

- Develop **create_link** function to generate and store shortened URLs securely.
- Create **stored procedures** to handle link generation efficiently.
- Implement a function to **sanitize and validate URLs** before storing.
- Implement **redirect** function to handle URL redirection.

### Step 9: Setting up Auth

- Integrate Supabase **Auth** for user sign-up/login using email.
- Implement **JWT-based authentication** for secure access control.
- Implement **forgot password** email and **reset password** link using access tokens for security.
- Implement **email change** requests with confirmation links sent to both, new and old emails.

### Step 10: Integrate Shortener into App.js

- Connect the **input form** with backend logic for URL shortening.
- Implement API requests using **fetch** or **supabase**.
- Display shortened URLs dynamically after generation.

### Step 11: Making Frontend Listen to Auth & Realtime Data

- Connect **React state** with Supabase Auth to track login status.
- Use **realtime subscriptions** to dynamically update the app.
    - New links/codes added
    - Links/codes deleted
    - User profile changes

### Step 12: Setup the Redirection Site

- Create a simple **redirect service** that handles shortened URLs efficiently.
- Call the `redirect` Supabase Edge Function
- Ensure proper **HTTP status codes** for redirects (e.g., 301 for permanent).
    
> Note: Since this site uses GitHub Pages to host, a 301 response does not work to redirect the user (CORS errors). A workaround is to use a 404.html page that GitHub will provide to users, which then redirects to a search query URL. For example, [url.setulp.com/test](http://url.setulp.com/test) would redirect to [url.setulp.com/?key=test](http://url.setulp.com/?key=test), where the script run by index.html will take the search parameter “key” and use it to search the database. Once found, the user is redirected via a meta refresh element (browser-level caching), and the long URL is stored in local storage for site-level caching.

### Step 13: Running the Application

- **Test the application** across multiple browsers for compatibility.
- Deploy to **GitHub Pages** with a custom domain for easy sharing.
- Ensure domain DNS config and custom email addresses are working.

## What's Next? 🌟🔜

Future enhancements I’m considering:

- **User Profiles & Visibility:** Improve alias settings, enable public profile viewing, and introduce display names.
- **Better Organization & Searchability:** Add filtering and search for My Stuff.
- **Customization & Control:** Allow users to manage their publicly shown links and codes via a dedicated dialog.
- **Enhancing User Roles:** Implement role-based perks for VIPs, subscribers, and moderators.
- **Quality & Usability Fixes:** Address profile page issues and integrate badge level requests.
- **Advanced Features:** Introduce long URL checks, notify users of existing short URLs, and support custom domains for redirects.
- **Better analytics**, providing insights into click rates and usage.
- **Improved UI styling**, ensuring a sleek and intuitive experience.
- **Expanding authentication options**, such as OAuth for seamless login and removing invite only functionality.

## Let's Connect and Share! 👥🌐

I’d love feedback on this project! Feel free to reach out or check out the codebase to explore how it works.
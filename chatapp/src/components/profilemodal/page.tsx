  // "use client";
  // import React, { useState } from "react";
  // import styles from "./profilemodal.module.css"; // Assuming custom CSS file
  // import { FaUserCircle } from "react-icons/fa";

  // interface User {
  //   id: number;
  //   name: string;
  //   profilepic: string;
  // }
  // interface Prop{
  //   user:User | null;
  //   isOpen:boolean;
  //   close:()=> void;
  // }
  // const ProfileModal= ({user,isOpen}:Prop) => {

  
  //   return (
  //     <div>
  //       {/* FaUserCircle to open the modal */}

  //       {/* Modal Overlay and Content */}
  //       {isOpen && user && (
  //         <div className={styles.modalOverlay}>
  //           <div className={styles.modalContent}>
  //             <h2>Profile</h2>

  //             {/* Profile Picture */}
  //             <div className={styles.profilePicContainer}>
  //               {user.profilepic ? (
  //                 <img src={user.profilepic} alt="Profile" className={styles.profilePic} />
  //               ) : (
  //                 <FaUserCircle className={styles.defaultPic} />
  //               )}
  //             </div>

  //             {/* Display Name */}
  //             <div className={styles.nameContainer}>
  //               <h3>{user.name}</h3>
  //             </div>

  //             {/* Cancel Button */}
  //             <button className={styles.closeButton} onClick={close}>
  //               Cancel
  //             </button>
  //           </div>
  //         </div>
  //       )}
  //     </div>
  //   );
  // };

  // export default ProfileModal;



  "use client";
import React from "react";
import styles from "./profilemodal.module.css"; // Assuming custom CSS file
import { FaUserCircle } from "react-icons/fa";

interface User {
  id: number;
  name: string;
  profilepic: string;
}

interface Prop {
  user: User | null;
  isOpen: boolean;
  close: () => void;
}

const ProfileModal: React.FC<Prop> = ({ user, isOpen, close }) => {
  if (!isOpen) return null; // Don't render anything if the modal is not open

  return (
    <div className={styles.modalOverlay} onClick={close}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2>Profile</h2>

        {/* Profile Picture */}
        <div className={styles.profilePicContainer}>
          {user?.profilepic ? (
            <img src={user.profilepic} alt="Profile" className={styles.profilePic} />
          ) : (
            <FaUserCircle className={styles.defaultPic} />
          )}
        </div>

        {/* Display Name */}
        <div className={styles.nameContainer}>
          <h3>{user?.name}</h3>
        </div>

        {/* Cancel Button */}
        <button className={styles.closeButton} onClick={close}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ProfileModal;

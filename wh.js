// import React, { useEffect, useState } from "react";
// import axios from "axios";

// export default function Notifications({ token }) {
//   const [notifications, setNotifications] = useState([]);

//   useEffect(() => {
//     const fetchNotifications = async () => {
//       const res = await axios.get("/api/notifications", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setNotifications(res.data);
//     };
//     fetchNotifications();
//   }, []);

//   const markAsRead = async (id) => {
//     await axios.put(`/api/notifications/${id}/read`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
//   };

//   return (
//     <div>
//       <h3>Notifications</h3>
//       {notifications.map(n => (
//         <div key={n._id} style={{ background: n.read ? "#f0f0f0" : "#fff", margin: "5px", padding: "10px", border: "1px solid #ddd" }}>
//           <h4>{n.title}</h4>
//           <p>{n.message}</p>
//           <button onClick={() => markAsRead(n._id)}>Mark as read</button>
//         </div>
//       ))}
//     </div>
//   );
// }
// router.put("/reorder", async (req, res) => {
//   const { categories } = req.body;

//   try {
//     const updates = categories.map((cat, index) =>
//       Category.findByIdAndUpdate(cat._id, { order: index })
//     );

//     await Promise.all(updates);

//     res.json({ message: "Order updated" });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to reorder" });
//   }
// });
// const categories = await Category
//   .find({ bussninsId: bussniseId })
//   .sort({ order: 1 });
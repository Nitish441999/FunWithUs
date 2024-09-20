import { useState, useEffect, useRef } from 'react';
import { FaSignOutAlt } from 'react-icons/fa';
import { auth, db } from '../../firebaseConfig';
import { collection, doc, getDocs, updateDoc, arrayUnion, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

function ChatBox() {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [message, setMessage] = useState("");
  const [customers, setCustomers] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const navigate = useNavigate();

  // Fetch customers data from Firebase
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const customersCollection = collection(db, 'users');
        const customerSnapshot = await getDocs(customersCollection);
        const customerList = customerSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(customer => customer.id !== auth.currentUser.uid); // Exclude current user
        setCustomers(customerList);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
  
    fetchCustomers();
  }, []);
  

  // Set up real-time listener for messages of selected customer
  useEffect(() => {
    if (selectedCustomer) {
      const customerRef = doc(db, 'users', selectedCustomer.id);

      const unsubscribe = onSnapshot(customerRef, (doc) => {
        const customerData = doc.data();
        setSelectedCustomer(customerData);
      });

      return () => unsubscribe();
    }
  }, [selectedCustomer?.id]);

  const handleSendMessage = async () => {
    if (message.trim() && selectedCustomer) {
      const newMessage = {
        text: message,
        type: 'sent',
        timestamp: new Date(),
        status: 'sent', // Default status when sent
      };

      try {
        const customerRef = doc(db, 'users', selectedCustomer.id);

        // Update the customer's document with the new message
        await updateDoc(customerRef, {
          messages: arrayUnion(newMessage),
        });

        // Clear the message input field
        setMessage('');
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (messagesEndRef.current && messagesContainerRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [selectedCustomer?.messages]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success("User signed out successfully");
      navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.closest('.signout-dropdown') === null) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

// ---------------------chech user is online ya not-------------------------------------------//
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // User is signed in
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      status: 'online',
    });
  } else {
    // User is signed out
    if (auth.currentUser) {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        status: 'offline',
      });
    }
  }
});


  return (
    <div className="flex h-screen overflow-hidden">
    {/* Sidebar */}
    <div className={`w-full md:w-1/4 bg-white border-r border-gray-300 ${selectedCustomer ? 'hidden md:block' : 'block'}`}>
      {/* Sidebar Header */}
      <header className="p-4 border-b border-gray-300 flex items-center justify-between bg-indigo-600 text-white">
        <h1 className="text-2xl font-semibold">Chat Web</h1>
        <div className="relative">
          <FaSignOutAlt 
            className="text-2xl cursor-pointer"
            onClick={() => setDropdownVisible(!dropdownVisible)}
          />
          {dropdownVisible && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg signout-dropdown">
              <ul>
                <li
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                  onClick={handleSignOut}
                >
                  Sign Out
                </li>
              </ul>
            </div>
          )}
        </div>
      </header>

      {/* Contact List */}
      <div className="overflow-y-auto h-screen p-3 mb-9 pb-20">
        {customers.map((customer) => (
          <div
            key={customer.id}
            className={`flex items-center mb-4 cursor-pointer p-2 rounded-md 
            ${selectedCustomer && selectedCustomer.id === customer.id ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            onClick={() => setSelectedCustomer(customer)}
          >
            <div className="relative w-12 h-12 bg-gray-300 rounded-full mr-3">
              <img
                src={customer.profilePicture || '/path/to/default-avatar.png'}
                alt={`${customer.name} Avatar`}
                className="w-12 h-12 rounded-full"
              />
              {customer.status === 'online' && (
                <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{customer.name || 'Unknown'}</h2>
              <p className="text-gray-600">{customer.status || 'No Status'}</p>
              <p className="text-gray-600">
                {customer.messages?.[customer.messages.length - 1]?.text || "No messages"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Main Chat Area */}
    <div className={`flex-1 ${selectedCustomer ? 'block' : 'hidden md:block'}`}>
      {/* Chat Header */}
      <header className={`bg-white p-4 shadow-sm shadow-gray-200 text-gray-700 ${selectedCustomer ? 'block' : 'hidden md:block'}`}>
        {selectedCustomer && (
          <div className="flex items-center">
            <div className="relative">
              <img
                src={selectedCustomer.profilePicture || '/path/to/default-avatar.png'}
                alt={`${selectedCustomer.name} Avatar`}
                className="w-12 h-12 rounded-full mr-3"
              />
              {selectedCustomer.status === 'online' && (
                <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-semibold">{selectedCustomer.name || 'Unknown'}</h1>
              <p className="text-gray-500">{selectedCustomer.status || 'No Status'}</p>
            </div>
          </div>
        )}
      </header>

      {/* Chat Messages */}
      <div
        ref={messagesContainerRef}
        className={`h-[calc(100vh-160px)] overflow-y-auto p-4 pb-5 ${selectedCustomer ? 'block' : 'hidden md:block'}`}
      >
        {selectedCustomer ? (
          <div>
            {selectedCustomer.messages?.length > 0 ? (
              selectedCustomer.messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex mb-4 ${msg.type === 'sent' ? 'justify-end' : ''}`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center mr-2 ${msg.type === 'sent' ? 'order-last ml-2' : ''}`}
                  >
                    <img
                      src={selectedCustomer.profilePicture || '/path/to/default-avatar.png'}
                      alt={`${selectedCustomer.name} Avatar`}
                      className="w-8 h-8 rounded-full"
                    />
                  </div>
                  <div
                    className={`flex max-w-96 rounded-lg p-3 gap-3 ${
                      msg.type === 'sent' ? 'bg-indigo-100 text-indigo-900' : 'bg-white text-gray-700'
                    }`}
                  >
                    <p>{msg.text}</p>
                    {msg.type === 'sent' && (
                      <div className="flex items-center ml-2">
                        {msg.status === 'sent' && <span className="text-red-500">✓</span>}
                        {msg.status === 'delivered' && <span className="text-yellow-500">✓✓</span>}
                        {msg.status === 'seen' && <span className="text-green-500">✓✓</span>}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-center mt-10">
                No messages display.
              </div>
            )}
            <div ref={messagesEndRef} /> {/* Empty div to scroll into view */}
          </div>
        ) : (
          <div className="text-gray-500 text-center mt-10">
            Please select a customer from the left to view their details.
          </div>
        )}
      </div>

      {/* Chat Input */}
      {selectedCustomer && (
        <footer className="bg-white border-t border-gray-300 p-4 fixed bottom-0 w-full">
          <div className="flex items-center">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="w-full sm:w-3/4 md:w-2/3 lg:w-4/6 p-2 rounded-md border border-gray-400 focus:outline-none focus:border-blue-500"
            />
            <button
              className="bg-indigo-500 text-white px-4 py-2 rounded-md ml-2"
              onClick={handleSendMessage}
            >
              Send
            </button>
          </div>
        </footer>
      )}
    </div>
  </div>
  );
}

export default ChatBox;

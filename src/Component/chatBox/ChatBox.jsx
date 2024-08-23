import React, { useState, useRef, useEffect } from 'react';

const initialCustomers = [
  {
    id: 1,
    name: 'Alice',
    status: 'Online',
    messages: [{ text: 'Hoorayy!!', type: 'received' }],
    avatar: 'https://placehold.co/200x/ffa8e4/ffffff.svg?text=ʕ•́ᴥ•̀ʔ&font=Lato',
  },
  {
    id: 2,
    name: 'Martin',
    status: 'Away',
    messages: [{ text: 'That pizza place was amazing! We should go again sometime. 🍕', type: 'received' }],
    avatar: 'https://placehold.co/200x/ad922e/ffffff.svg?text=ʕ•́ᴥ•̀ʔ&font=Lato',
  },
  // Add more customers as needed
];

function ChatBox() {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [message, setMessage] = useState("");
  const [customers, setCustomers] = useState(initialCustomers);
  const messagesEndRef = useRef(null); // Ref for scrolling to the bottom
  const messagesContainerRef = useRef(null); // Ref for messages container

  const handleSendMessage = () => {
    if (message.trim() && selectedCustomer) {
      const updatedCustomers = customers.map((customer) => {
        if (customer.id === selectedCustomer.id) {
          return {
            ...customer,
            messages: [...customer.messages, { text: message, type: 'sent' }],
          };
        }
        return customer;
      });

      setCustomers(updatedCustomers);
      setSelectedCustomer({
        ...selectedCustomer,
        messages: [...selectedCustomer.messages, { text: message, type: 'sent' }],
      });
      setMessage('');
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
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight; // Scroll to bottom
    }
  }, [selectedCustomer?.messages]); // Trigger scroll when messages change

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className={`w-full md:w-1/4 bg-white border-r border-gray-300 ${selectedCustomer ? 'hidden md:block' : 'block'}`}>
        {/* Sidebar Header */}
        <header className="p-4 border-b border-gray-300 flex flex-col items-center bg-indigo-600 text-white">
          <h1 className="text-2xl font-semibold mb-4">Chat Web</h1>
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
              <div className="w-12 h-12 bg-gray-300 rounded-full mr-3">
                <img
                  src={customer.avatar}
                  alt={`${customer.name} Avatar`}
                  className="w-12 h-12 rounded-full"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{customer.name}</h2>
                <p className="text-gray-600">{customer.status}</p>
                <p className="text-gray-600">
                  {customer.messages[customer.messages.length - 1]?.text || "No messages"}
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
              <img
                src={selectedCustomer.avatar}
                alt={`${selectedCustomer.name} Avatar`}
                className="w-12 h-12 rounded-full mr-3"
              />
              <div>
                <h1 className="text-2xl font-semibold">{selectedCustomer.name}</h1>
                <p className="text-gray-500">{selectedCustomer.status}</p>
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
              {selectedCustomer.messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex mb-4 ${msg.type === 'sent' ? 'justify-end' : ''}`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center mr-2 ${msg.type === 'sent' ? 'order-last ml-2' : ''}`}
                  >
                    <img
                      src={selectedCustomer.avatar}
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
                  </div>
                </div>
              ))}
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

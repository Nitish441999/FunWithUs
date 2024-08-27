// Real-time listener for selected customer
  // useEffect(() => {
  //   if (selectedCustomer) {
  //     const customerRef = doc(db, 'users', selectedCustomer.id);

  //     const unsubscribe = onSnapshot(customerRef, (docSnapshot) => {
  //       const updatedCustomer = docSnapshot.data();
  //       if (updatedCustomer) {
  //         setSelectedCustomer(updatedCustomer);
  //         setCustomers(prevCustomers =>
  //           prevCustomers.map(customer =>
  //             customer.id === selectedCustomer.id
  //               ? updatedCustomer
  //               : customer
  //           )
  //         );
  //       }
  //     });

  //     return () => unsubscribe();
  //   }
  // }, [selectedCustomer]);
import easyinvoice from 'easyinvoice';

const downloadInvoice = async (booking) => {
    const data = {
      documentTitle: 'Booking INVOICE', //Defaults to INVOICE
      // "locale": "de-DE", //Defaults to en-US, used for number formatting (see docs)
      currency: 'USD', //See documentation 'Locales and Currency' for more info
      taxNotation: 'vat', //or gst
      marginTop: 25,
      marginRight: 25,
      marginLeft: 25,
      marginBottom: 25,
      logo: 'https://res.cloudinary.com/bookit/image/upload/v1617904918/bookit/bookit_logo_cbgjzv.png', //or base64
      // background: 'https://public.easyinvoice.cloud/img/watermark-draft.jpg', //or base64 //img or pdf
      sender: {
        company: 'Book IT',
        address: 'Sample Street 123',
        zip: '1234 AB',
        city: 'Sampletown',
        country: 'Samplecountry',
      },

      client: {
        company: `${booking.user.name}`,
        address: `${booking.user.email}`,
        zip: '',
        city: `Check In:${new Date(booking.checkInDate).toLocaleString(
          'en-US'
        )}`,
        country: `Check Out:${new Date(booking.checkOutDate).toLocaleString(
          'en-US'
        )}`,
      },
      invoiceNumber: `${booking._id}`,
      invoiceDate: `${new Date(Date.now()).toLocaleString('en-US')}`,
      products: [
        {
          quantity: `${booking.daysOfStay}`,
          description: `${booking.room.name}`,
          tax: 0,
          price: `${booking.room.pricePerNight}`,
        },
      ],
      bottomNotice: 'This is auto generated Invoice of your booking on Book IT',
    };

    const result = await easyinvoice.createInvoice(data);
    easyinvoice.download(`invoice_${booking._id}.pdf`, result.pdf);
  };


  export default downloadInvoice
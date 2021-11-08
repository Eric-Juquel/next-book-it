import { getSession } from 'next-auth/client';

import UserBookings from '../../components/booking/UserBookings';
import Layout from '../../components/layout/Layout';

import { userBookings } from '../../redux/actions/bookingActions';
import { wrapper } from '../../redux/store';

const UserBookingsPage = () => {
  return (
    <Layout title="My Bookings">
      <UserBookings />
    </Layout>
  );
};

export const getServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ req }) => {
      const session = await getSession({ req });

      if (!session) {
        return {
          redirect: {
            destination: '/login',
            permanent: false,
          },
        };
      }

      await store.dispatch(userBookings(req.headers.cookie, req));
    }
);

export default UserBookingsPage;

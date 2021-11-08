import absoluteUrl from 'next-absolute-url';
import { getSession } from 'next-auth/client';

import UpdateRoom from '../../../components/admin/UpdateRoom';
import Layout from '../../../components/layout/Layout';

const UpdateRoomPage = ({categoriesOptions}) => {
  return (
    <Layout title=" Update Room">
      <UpdateRoom categoriesOptions={categoriesOptions}/>
    </Layout>
  );
};

export const getServerSideProps = async (context) => {
  const session = await getSession({ req: context.req });

  if (!session || session.user.role !== 'admin') {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  const { origin } = absoluteUrl(context.req);

  const res = await fetch(`${origin}/api/rooms/options`);

  const data = await res.json();

  return {
    props: {
      session,
      categoriesOptions: data.options,
    },
  };
};

export default UpdateRoomPage;

import { getSession } from 'next-auth/client';

import UdpdateUser from '../../../components/admin/UpdateUser';
import Layout from '../../../components/layout/Layout';



const UdpdateUserPage = () => {
  return (
    <Layout title=' Update User' >
      <UdpdateUser />
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

  return {
    props: { session },
  };
};

export default UdpdateUserPage ;

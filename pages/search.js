import Search from '../components/Search';
import Layout from '../components/layout/Layout';
import absoluteUrl from 'next-absolute-url';

export default function SearchPage({categoriesOptions}) {
 
  return (
    <Layout title="Search Rooms">
      <Search categoriesOptions={categoriesOptions} />
    </Layout>
  );
}

export const getServerSideProps = async (context) => {
  const { origin } = absoluteUrl(context.req);

  const res = await fetch(`${origin}/api/rooms/options`);

  const data = await res.json();

  return {
    props: { categoriesOptions: data.options },
  };
};

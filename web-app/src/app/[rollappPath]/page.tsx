export default async function Overview() {
  await new Promise(resolve => setTimeout(resolve, 5000));
  return <>Overview</>;
}

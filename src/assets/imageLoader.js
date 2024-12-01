const importAll = (r) => {
    let images = {};
     // eslint-disable-next-line
    r.keys().map((item) => { images[item.replace('./', '')] = r(item); });
    return images;
  };
  
  const images = importAll(require.context('./carousel', false, /\.(jpg|jpeg|png)$/));
  
  export default images;
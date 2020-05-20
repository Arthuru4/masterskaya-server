module.exports = function(app, client) {
  app.post("/setproducts", (req, resp) => {
    const db = client.db("Masterskaya");
    const products = db.collection("products");
    const note = req.body;

    products.insertMany(note, (err, result) => {
      if (err) {
        resp.send({ error: "An error has occurred" });
      } else {
        resp.send({ type: "success" });
      }
      // client.close();
    });
  });

  app.get("/getproductbyid", (req, resp) => {
    const db = client.db("Masterskaya");
    const products = db.collection("products");
    const note = req.query.id ? { id: req.query.id } : {};

    products.find(note).toArray((err, result) => {
      if (err) {
        resp.send(err);
      } else {
        resp.send({ type: "success" });
      }
      // client.close();
    });
  });

  app.post("/updateproductbyid", (req, resp) => {
    const db = client.db("Masterskaya");
    const products = db.collection("products");

    if (!req.body.id) {
      resp.send({ error: "No ID in request" });
      return;
    }

    const note = { id: req.body.id };
    const newvalues = { $set: { ...req.body } };

    delete newvalues.$set.id;

    products.updateOne(note, newvalues, (err, result) => {
      if (err) {
        resp.send({ error: "An error has occurred" });
      } else {
        console.log("document updated, id:", req.body.id);
        resp.send({ type: "document updated" });
      }
      // client.close();
    });
  });
};

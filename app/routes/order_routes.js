module.exports = function(app, client) {
  const nodemailer = require("nodemailer");
  const creds = require("./../../config");
  const transport = {
    host: creds.HOST,
    port: creds.PORT,
    auth: {
      user: creds.USER,
      pass: creds.PASS
    }
  };

  const transporter = nodemailer.createTransport(transport);

  transporter.verify(error => {
    if (error) {
      console.log(error);
    } else {
      console.log("Server is ready to take messages on port: 3002");
    }
  });

  app.post("/order", async (req, res) => {
    const db = client.db("Masterskaya");
    const products = db.collection("products");
    const orders = db.collection("orders");
    const counters = db.collection("counters");

    const {
      name,
      email,
      mobile,
      city,
      deliveryType,
      deliveryData
    } = req.body.userInfo;
    const content = `name: ${name} \n mobile: ${mobile} \n city: ${city} \n deliveryType: ${deliveryType} \n deliveryData: ${deliveryData} `;
    console.log(`GOT ORDER from user name[${name}], mobile[${mobile}].`);

    let positions;

    const _ids = req.body.positions.map(el => {return {id:el.id, count: el.count}});

    products.find({ id: { $in: _ids.map(el => el.id) } }).toArray((err, result) => {
      if (err) {
        res.send(err);
      } else {
        positions = _ids;

        const orderData = {
          userInfo: req.body.userInfo,
          positions,
          date: new Date()
        };

        const mail = {
          from: name,
          to: creds.MAIL_TO,
          subject: `New ORDER from ${name}, mob: ${mobile}`,
          text: `${content} \n\n ЗАКАЗ:\n${JSON.stringify(positions)}`
        };

        let clientMessage;

        orders.insertOne(orderData, (err, result) => {
          if (err) {
            res.json({
              status: "fail"
            });
          } else {
            let _id = parseInt(result.insertedId.toString().slice(-10), 16)

            if (email) {
              clientMessage = {
                from: "masterskaya",
                to: email,
                subject: `Спасибо. Заказ отправлен в обработку`,
                text: `Заказ номер ${_id} отправлен в обработку.\nС Вами свяжутся в ближайшее время по указанному номеру телефона для уточнения деталей.\n
       Детали заказа:\n${JSON.stringify(positions)}\n\n`
              };

              transporter.sendMail(clientMessage, (err, data) => {
                if (err) {
                  console.log(
                    `ORDER clientMessage from user name[${name}], mobile[${mobile}] FALL WITH ERROR\n${err}`
                  );
                } else {
                  console.log(
                    `ORDER clientMessage from user name[${name}], mobile[${mobile}] SUCCESSFULLY SENT`
                  );
                }
              });
            }

            transporter.sendMail(mail, (err, data) => {
              if (err) {
                console.log(
                  `ORDER mail from user name[${name}], mobile[${mobile}] FALL WITH ERROR\n${err}`
                );
              } else {
                console.log(
                  `ORDER mail from user name[${name}], mobile[${mobile}] SUCCESSFULLY SENT`
                );
              }
            });

            res.json({
              status: "success",
              orderId: _id
            });
          }
        });
      }
      // client.close();
    });
  });

  app.post("/getInTouch", (req, res) => {
    const db = client.db("Masterskaya");
    const products = db.collection("products");

    const name = req.body.name;
    const email = req.body.email;
    const message = req.body.msg;
    const content = `name: ${name} \n email: ${email} \n message: ${message} `;
    console.log(`GOT message from user name[${name}], email[${email}].`);

    const mail = {
      from: name,
      to: creds.MAIL_TO,
      subject: "New Message from Contact Form",
      text: content
    };

    transporter.sendMail(mail, (err, data) => {
      if (err) {
        console.log(
          `Message from user name[${name}], email[${email}] FALL WITH ERROR\n${err}`
        );

        res.json({
          status: "fail"
        });
      } else {
        console.log(
          `Message from user name[${name}], email[${email}] SUCCESSFULLY SENT`
        );

        res.json({
          status: "success"
        });
      }
    });
  });
};

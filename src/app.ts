import path from 'path';
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { findOpen } from './restaurant';

export const app = express();

app.set('view engine', 'ejs');

app.route('/').get((req, res) => {
    res.sendFile(path.resolve('./views/default.html'));
});

type ReqDict = {};
type ReqBody = { datepicker?: string }
type RestaurantQuery = { datepicker?: string };
type RestaurantResponse = { data: string[] };
type RestaurantOpenRequest = Request<ReqDict, RestaurantResponse, ReqBody, RestaurantQuery>;

function handleFindRestaurants(req: RestaurantOpenRequest, res: Response) {
    const db = app.get('db');
    const datepicker = req.body.datepicker || req.query.datepicker || '';
    // console.log( { method: req.method, body: req.body, query: req.query, datepicker  });
    const datetime = new Date( Date.parse( datepicker ) );
    const results = findOpen( db, datetime );
    console.log({ datepicker, numOpen: results.length } );
    res.json( results );
}

app.use(bodyParser.json());

app.route('/restaurant/findOpen').get(handleFindRestaurants);
app.route('/restaurant/findOpen').post(handleFindRestaurants);

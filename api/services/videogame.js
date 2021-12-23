const pool = require('../libs/postgres.pool');
const config = require('../config/config');

class VideogameService {
  constructor() {
    this.populateDatabse();
    this.pool = pool;
    this.pool.on('error', (err) => {
      console.error(err);
    });
  }

  async populateDatabse() {
    try {
      const query = 'SELECT * FROM videogames';
      const data = await this.pool.query(query);

      let listOfPromises = [];

      if (!data) {
        for (let i = 0; i < 78; i++) {
          listOfPromises.push(
            fetch(
              `https://api.rawg.io/api/games?key=${config.apiKey}&page=${i + 1}`
            )
          );
        }
      }

      let allPromises = Promise.all(listOfPromises); // This was moved from line 19 to here (commit changes)
      // Also added image to query and

      const allData = await allPromises;
      await allData.map((data) => {
        const dataJSON = await data.json();
        const query =
          'INSERT INTO videogames(id, name, image, description, rating, release_date) VALUES($1, $2, $3, $4, $5, $6)';
        await this.pool.query(query, [
          dataJSON.results.id,
          dataJSON.results.name,
          dataJSON.results.background_image,
          dataJSON.results.description,
          dataJSON.results.rating,
          dataJSON.results.released,
        ]);
      });
    } catch (error) {
      console.error(error);
    }
  }

  async getFirstFifteenVideogames() {
    const query = `SELECT * FROM videogames
                  INNER JOIN videogames_genres ON videogames.id = videogames_genres.videogame_id
                  INNET JOIN genres ON videogames_genres.genre_id = genre.id
                  LIMIT 15`;
    const data = await this.pool.query(query);

    return data.rows;
  }

  async getFirstFifteenVideogamesByName(name) {
    const query = `SELECT * FROM videogames
                  INNER JOIN videogames_genres ON videogames.id = videogames_genres.videogame_id
                  INNET JOIN genres ON videogames_genres.genre_id = genre.id
                  INNER JOIN videogames_platforms ON videogames_platforms.videogame_id = videogames.id
                  INNER JOIN platforms ON videogames_platforms.platform_id = platforms.id
                  WHERE videogames.name LIKE %$name%
                  LIMIT 15`;
    const data = await this.pool.query(query, name);

    return data.rows;
  }

  async getVideogameById(id) {
    const query = `SELECT * FROM videogames
                  INNER JOIN videogames_genres ON videogames.id = videogames_genres.videogame_id
                  INNET JOIN genres ON videogames_genres.genre_id = genre.id
                  INNER JOIN videogames_platforms ON videogames_platforms.videogame_id = videogames.id
                  INNER JOIN platforms ON videogames_platforms.platform_id = platforms.id
                  WHERE videogames.id = $id`;
    const data = await this.pool.query(query, id);

    return data;
  }
}

module.exports = VideogameService;

from bs4 import BeautifulSoup
import json
import requests
import re


class Movie():
    def __init__(self, nor = False):
        pass

    @staticmethod
    def imdb_id(movid):

        # self.movid = movid
        RT = True

        movie = {
            'id':       None,
            'title':        None,
            'year':         None,
            'stars':        None,
            'cast':         None,
            # 'characters':   None,
            'directors':    None,
            # 'production_company': None,
            'writers':      None,
            'genres':       None,
            'duration':     None,
            'plot_short':   None,
            'plot_long':    None,
            'rating':       None,
            # 'awards':       None,
            'poster_url':   None,
            'parental_rating': None,
            'metascore':    None,
            'suggestions':  None,
            'tagline':      None,
            'wikidata_id':  None,
            'rotten_tomatoes': {},
            'metacritic_url': None,
            'metacritic_rating': None,
            'details': None,
        }

        error = []

        pattern = re.compile(r'[t]{2}[0-9]{7,8}')



        if pattern.search(movid):
            url = "http://www.imdb.com/title/" + movid
            # url = "https://13.32.221.251:443/title/" + self.movid

            soup = Movie.__create_soup(url)

            movie['id'] = Movie.id(soup)
            movie['title'] = Movie.title(soup)
            movie['year'] = Movie.year(soup)
            movie['stars'] = Movie.stars(soup)
            movie['cast'] = Movie.cast(soup)
            movie['directors'] = Movie.directors(soup)
            # movie['production_company'] = Movie.production_company(soup)
            movie['writers'] = Movie.writers(soup)
            movie['genres'] = Movie.genres(soup)
            movie['duration'] = Movie.duration(soup)
            movie['plot_short'] = Movie.plot_short(soup)
            movie['plot_long'] = Movie.plot_long(soup)
            movie['rating'] = Movie.rating(soup)
            movie['awards'] = Movie.awards(soup)
            movie['poster_url'] = Movie.poster(soup)
            movie['parental_rating'] = Movie.parental_rating(soup)
            movie['metascore'] = Movie.metascore(soup)

            movie['details'] = Movie.details(soup)

            # Movie.trailer()
            movie['suggestions'] = Movie.suggestions(soup)
            movie['tagline'] = Movie.tagline(soup)

            # if nor:
            #     self.soup_nor = self.__create_soup(url, nor=True)
            #     self.movie['title_nor'] = None
            #     self.title_nor()

            if RT:

                    # print(self.wiki_soup)
                Movie.wikidata(movid, movie)
                    # self.rotten_tomatoes_url()
                Movie.rotten_tomatoes_rating(movie)
                Movie.metacritic(movie)

            # self.print_error_msg()
            return movie

        else:
            print("Movapi: Movie id ''" + self.movid + "' not valid")
            return None

    @staticmethod
    def search(title, count=10):
        pattern = re.compile(r'[t]{2}[0-9]{7,8}')

        if pattern.search(title):
            # print('toøeu')
            return Movie.imdb_id(pattern.search(title).group())

        result = []

        title = re.sub('[^a-zA-Z0-9 \n\.]', '', title)

        print(title)

        try:
            url = 'https://www.imdb.com/find?q=' + title + '&s=tt'
            # if full:
            #     url = url + '&s=tt'

            soup = Movie.__create_soup(url)

            sections = soup.find_all('div', class_='findSection')
            print(sections)
            for section in sections:
                s = section.find_all('h3', class_='findSectionHeader')[0].text
                # print(s)
                if s == 'Titles':
                    # print('title')
                    res = section.find_all('tr', class_='findResult')
                    for i, m in enumerate(res):
                        movie = {}
                        if i > count:
                            break
                        movie['id'] = m.find_all('td', class_='result_text')[0].find('a')['href'].split('/title/')[1].split('/')[0]
                        # print(movie)
                        movie['poster_url'] = m.find_all('img')[0]['src']
                        movie['title'] = m.find_all('td', class_='result_text')[0].find('a').text

                        try:
                            year = re.findall(r"[(]{1}[0-9]{4}[)]{1}", m.find_all('td', class_='result_text')[0].text)[0]
                            movie['year'] = year.replace('(', '').replace(')', '')
                        except:
                            movie['year'] = None

                        result.append(movie)

            print(result)
            return result
            # return {'titles':result}

        except Exception as e:
	        print(e)

        return None




    def formatted_json(movie):
        return json.dumps(movie, indent = 4, ensure_ascii=True)

    # def print_error_msg(self):
    #     if len(self.error):
    #         print(str(len(self.error)) + " fields not found for '" + self.movid + "'")
    #         for msg in self.error:
    #             print(msg)
    #         print()
    #

    @staticmethod
    def __create_soup(url, nor = False):
        request = requests.get(url, headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:68.0) Gecko/20100101 Firefox/68.0",
            "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8"
        })

        if nor:
            request  = requests.get(url, headers  = {"Accept-Language": "no-NO, no;q=0.5"})
        # request  = requests.get(url)

        data = request.text
        soup = BeautifulSoup(data, "html.parser")
        return soup

    @staticmethod
    def id(soup):
        try:
            item = str(soup.find(property = 'pageId'))
            sep = '" property'
            rest = item.split(sep)[0]
            sep = 'content="'
            rest = rest.split(sep)[1]
            return rest
        except:
            return None

    @staticmethod
    def title(soup):
        try:
            item = soup.findAll("div", {"class":"title_wrapper"})[0].h1.getText()
            title = re.split(r'\(([\d]){4}\)', item)[0].strip()
            return title
        except:
            # self.error.append("title")
            return None

    @staticmethod
    def title_nor(soup):
        try:
            item = soup.soup_nor.find(itemprop = "name")
            title = str(item.next).strip()
            return title
        except:
            # self.error.append("title")
            return None

    @staticmethod
    def year(soup):
        try:
            item = soup.findAll("div", {"class":"title_wrapper"})[0].h1.getText()
            year = re.search(r'\(([\d]){4}\)', item).group().replace('(','').replace(')','')
            return year
        except:
            # self.error.append("year")
            return None

    @staticmethod
    def stars(soup):
        try:
            stars = []
            li = soup.find_all('div', {'class':'credit_summary_item'})
            for i in li:
                if 'Stars:' in i.text:
                    for a in i:
                        s = str(a)
                        if 'href="/name' in s:
                            dir = {}
                            dir['name'] = s.split('>')[1].split('<')[0]
                            dir['id'] = s.split('/name/')[1].split('/')[0]
                            stars.append(dir)

            return stars

        except:
            # self.error.append("stars")
            return None

    @staticmethod
    def cast(soup):
        try:
            cast = []
            li = soup.findAll('table', {'class', 'cast_list'})[0].findAll('tr')

            for r in li:
                td = r.findAll('td')
                # print(str(td))
                if 'castlist_label' in str(td):
                    continue
                # if
                c = {}
                for t in td:
                    s = str(t)
                    if 'class' not in s:
                        # print(s)
                        c['id'] = s.split('href="/name/')[1].split('/')[0]
                        c['name'] = s.split('> ')[1].split('\n')[0]
                    if 'class="character"' in s:
                        # print()
                        # print('\n\n')

                        c['character'] = str(t.text.replace('\t', '').replace('\n', '').replace('  ', ''))
                        # .replace('\n', '').replace('  ', '')
                cast.append(c)

            return cast

        except:
            # self.error.append("actors")
            return None

        # for l in li:
        #     a = l.findAll('a')
        #     for i in a:
        #         s = str(i)
        #         if 'class' not in s:
        #             print(s.split(''))
        # try:
        #     li = self.soup.find_all(itemprop="actor")
        #     templist = []
        #     for idx, item in enumerate(li):
        #         temp = li[idx].get_text()
        #         temp = temp.replace("\n", "")
        #         templist.append(temp.lstrip(' ').rstrip())
        #     self.movie['actors'] = templist
        # except:
        #     self.error.append("actors")

    @staticmethod
    def characters(soup):
        try:
            item = soup.findAll(itemprop = "actor")
            ch = soup.findAll('td', {'class':'character'})
            templist = []
            for i in range(len(item)):
                tempdict = {}
                tempdict['actor'] = item[i].get_text().replace("\n", "").lstrip(' ').rstrip()
                tempdict['character'] = ch[i].get_text().replace("\n", "").replace("  ", "").lstrip(' ').rstrip()
                templist.append(tempdict)
            return templist
        except Exception as e:
            # print(e)
            # self.error.append("characters")
            return None

    @staticmethod
    def directors(soup):
        try:
            directors = []
            li = soup.find_all('div', {'class':'credit_summary_item'})
            for i in li:
                if 'Director' in i.text:
                    for a in i:
                        s = str(a)
                        if 'href="/name' in s:
                            d = {}
                            d['id'] = s.split('/name/')[1].split('/')[0]
                            d['name'] = s.split('>')[1].split('<')[0]
                            directors.append(d)

            return directors

        except:
            # self.error.append("directors")
            return None

    @staticmethod
    def production_company(soup):
        try:
            companies = []
            temp = soup.findAll('div', {'class', 'txt-block'})
            for t in temp:
                h = str(t.find('h4'))
                if 'Production C' in h:
                    a = t.findAll('a')
                    for i in a:
                        s = i.text.strip()
                        if 'See more' in s:
                            continue
                        companies.append(s)
            return companies

        except:
            # self.error.append("production company")
            return None

    @staticmethod
    def writers(soup):
        try:
            directors = []
            li = soup.find_all('div', {'class':'credit_summary_item'})
            for i in li:
                if 'Writer' in i.text:
                    for a in i:
                        s = str(a)
                        if 'href="/name' in s:
                            d = {}
                            d['id'] = s.split('/name/')[1].split('/')[0]
                            d['name'] = s.split('>')[1].split('<')[0]
                            directors.append(d)

            return directors

        except:
            # self.error.append("directors")
            return None


    @staticmethod
    def genres(soup):
        try:
            genres = []
            temp = soup.findAll('div', {'class', 'inline'})
            for t in temp:
                c = t.find('h4')
                if 'Genres' in str(c):
                    gs = t.findAll('a')
                    for g in gs:
                        genres.append(g.text.strip())
                    break
            return genres
        except:
            # self.error.append("genres")
            return None

    ## -- Finds duration of movie,
    @staticmethod
    def duration(soup):
        try:
            dur = {}
            temp = soup.findAll('time')
            for d in temp:
                t = d.text.strip()
                if 'h' in t:
                    dur['hour'] = t
                else:
                    dur['min'] = t
                dur['stamp'] = str(d).split('datetime="')[1].split('"')[0]
            return dur
        except:
            # self.error.append("duration")
            return None

    @staticmethod
    def plot_long(soup):
        try:
            return soup.find('div', {'id': 'titleStoryLine'}).find('p').text.strip().split('\n')[0]
        except:
            # self.error.append("plot long")
            return None

    @staticmethod
    def plot_short(soup):
        try:
            return soup.find('div', {'class': 'summary_text'}).text.strip()
        except:
            # self.error.append("plot short")
            return None

    @staticmethod
    def rating(soup):
        try:
            li = soup.find_all(itemprop="ratingCount")
            ratingCount = li[0].get_text()

            li = soup.find_all(itemprop="ratingValue")
            ratingValue = li[0].get_text()

            li = soup.find_all(itemprop="bestRating")
            ratingBest = li[0].get_text()

            templist = []
            tempdict1 = {}
            tempdict2 = {}
            tempdict3 = {}

            tempdict1['value'] = ratingValue
            tempdict2['count'] = ratingCount
            tempdict3['best'] = ratingBest

            templist.append(tempdict1)
            templist.append(tempdict2)
            templist.append(tempdict3)

            return templist
        except:
            # self.error.append("rating")
            return None

    @staticmethod
    def awards(soup):
        try:
            li = soup.find_all("span", itemprop="awards")
            templist = []
            for i in li:
                u = (i.get_text().replace('.',''))
                u = re.sub("\s\s+", " ", u)
                templist.append(u.lstrip(' ').rstrip())
            return templist
        except:
            # self.error.append("awards")
            return None

    @staticmethod
    def poster(soup):
        try:
            li = soup.find_all('div', {'class':'poster'})
            for l in li:
                s = str(l)
                if 'src="' in s:
                    return s.split('src="')[1].split('"')[0]
        except:
            # self.error.append("poster URL")
            return None

    @staticmethod
    def parental_rating(soup):
        try:
            i = soup.find('div', {'class', 'subtext'})
            return i.text.split('|')[0].strip()
        except:
            # self.error.append("content Rating")
            return None

    @staticmethod
    def metascore(soup):
        try:
            temp = soup.find("div", { "class" : "metacriticScore score_favorable titleReviewBarSubItem" })
            return temp.get_text().lstrip().rstrip()
        except:
            # self.error.append("metascore")
            return None

    # def trailer(self):
    #     try:
    #         temp = self.soup.find(itemprop="trailer")
    #         url = "https://www.imdb.com" + temp['href']
    #         self.movie['trailer'] = url
    #     except:
    #         self.error.append("trailer")
        # print(url)
        # print(temp[0].get('src'))

    @staticmethod
    def suggestions(soup):
        try:
            temp = soup.findAll("div", {'class', 'rec_item'})
            ids = []
            for i in temp:
                ids.append(i.attrs['data-tconst'])
            return ids
        except:
            # self.error.append('suggestions')
            return None

    @staticmethod
    def tagline(soup):
        try:
            temp = soup.findAll("div", {'class', 'txt-block'})
            for t in temp:
                s = str(t)
                if 'Taglines' in s:
                    return t.text.split('\n')[2].split('\n')[0].strip()
                    # break


        except:
            # self.error.append('tagline')
            return None



    def details(soup):

        details = {
            'country': None
        }

        try:
            temp = soup.find("div", {'id': 'titleDetails'})
            temp = temp.findAll('div', {'class': 'txt-block'})

            for t in temp:
                inline = t.find('h4', {'class': 'inline'})

                if not inline:
                    continue

                # print(inline)
                # print('\n\n----')

                if 'Country' in inline.text:

                    c = t.findAll('a')
                    countries = []
                    for co in c:
                        countries.append(co.text.strip())

                    details['countries'] = countries



                elif 'Language' in inline.text:
                    l = t.findAll('a')
                    languages = []
                    for lan in l:
                        languages.append(lan.text.strip())

                    details['languages'] = languages

                elif 'Release Date' in inline.text:
                    details['release_date'] = t.text.split(':')[1].split('\n')[0].strip()

                elif 'Also Known As' in inline.text:
                    details['also_known_as'] = t.text.split(':')[1].split('\n')[0].strip()

                elif 'Budget' in inline.text:
                    details['budget'] = t.text.split(':')[1].split('\n')[0].strip()

                elif 'Production Co' in inline.text:

                    companies = t.findAll('a')
                    details['production_company'] = []

                    for co in companies:
                        s = co.text.strip()
                        if 'See more' in s:
                            continue
                        details['production_company'].append(s)



            return details

        except Exception as e:
            print(e)
            return None

    @staticmethod
    def wikidata(movid, imdb_obj):
        print('wikidata')
        try:
            url = "https://www.wikidata.org/w/index.php?search=" + movid
            soup = Movie.__create_soup(url)

            temp = soup.findAll('ul', {'class', 'mw-search-results'})

            for li in temp:
                t = li.findAll('div', {'class', 'mw-search-result-heading'})
                mov = t[0].find('a')
                href = mov.get('href')
                wikidata_id = href.split('/')[2]
                title = mov.get('title').encode('ascii','ignore').decode()
                tit,year = title.split('|')
                year = year.strip().split(' ')[0]
                print(tit, year)
                # .replace('\u200e', '')
                # tit = tit.replace('\u200e', '')

                if (imdb_obj['year'] == year):
                    imdb_obj['wikidata_id'] = wikidata_id

                    url = 'https://www.wikidata.org/wiki/' + imdb_obj['wikidata_id']

                    soup = Movie.__create_soup(url)

                    try:
                        temp = soup.find('div', {'id': 'P1258'})
                        rotten_tomatoes_url = temp.find('a', {'class':'wb-external-id external'}).get('href')
                        imdb_obj['rotten_tomatoes']['url'] = rotten_tomatoes_url
                    except Exception as e:
                        print(e)
                        imdb_obj['rotten_tomatoes']['url'] = None

                    try:
                        temp = soup.find('div', {'id': 'P1712'})
                        metacritic_url = temp.find('a', {'class':'wb-external-id external'}).get('href')
                        imdb_obj['metacritic_url'] = metacritic_url
                    except Exception as e:
                        print(e)
                        imdb_obj['metacritic_url'] = None

                else:
                    pass
        except Exception as e:
            print(e)
            imdb_obj['wikidata_id'] = None

    # def rotten_tomatoes_url(self):
    #     try:
    #         url = 'https://www.wikidata.org/wiki/' + self.movie['wikidata_id']
    #
    #         soup = self.__create_soup(url)
    #
    #         temp = soup.find('div', {'id': 'P1258'})
    #         href = temp.find('a', {'class':'wb-external-id external'}).get('href')
    #
    #         self.movie['rotten_tomatoes']['url'] = href
    #     except:
    #         self.error.append('rotten_tomatoes_url')

    @staticmethod
    def rotten_tomatoes_rating(movie):
        try:
            url = movie['rotten_tomatoes']['url']

            soup = Movie.__create_soup(url)

            rating = {}
            tomatometer = {}
            audience = {}

            try:
                critics = soup.find('div', {'class', 'mop-ratings-wrap__half'})
                tomatometer['score'] = critics.find('span', {'class', 'mop-ratings-wrap__percentage'}).text.strip()
                tomatometer['count'] = critics.find('small', {'class', 'mop-ratings-wrap__text--small'}).text.strip()
            except:
                tomatometer['score'] = None
                tomatometer['count'] = None

            try:
                users = soup.find('div', {'class', 'mop-ratings-wrap__half audience-score'})
                audience['score'] = users.find('span', {'class', 'mop-ratings-wrap__percentage'}).text.strip()
                audience['count'] = users.find('strong', {'class', 'mop-ratings-wrap__text--small'}).text.split('Ratings: ')[1]
            except:
                audience['score'] = None
                audience['count'] = None

            rating['audience'] = audience
            rating['tomatometer'] = tomatometer
            movie['rotten_tomatoes']['rating'] = rating

        except Exception as e:
            print(e)
            movie['rotten_tomatoes']['rating'] = None

    @staticmethod
    def metacritic(movie):
        try:
            url = movie['metacritic_url']
            # print(url)
            soup = Movie.__create_soup(url)

            r = soup.find('div', {'id':'videoContainer_wrapper'})
            trailer_url = r.get('data-mcvideourl')

            # if movie['details']:
            #     movie['details']['trailer_url'] = trailer_url
            # else:
            #     movie['details'] = {'trailer_url': trailer_url}

        except Exception as e:
            print(e)
            # movie['trailer_url'] = None

        try:
            metacritic_rating = {}
            # score = soup.findAll('div', {'class', 'metascore_w larger '})
            score = soup.select_one('div.metascore_w.larger.movie')
            # print(score.getText())
            metacritic_rating['metascore'] = score.getText()


            user_score = soup.select_one('div.metascore_w.user.larger.movie')
            # print(user_score.getText())
            metacritic_rating['user_score'] = user_score.getText()

            movie['metacritic_rating'] = metacritic_rating

        except Exception as e:
            print(e)
            movie['metacritic_rating'] = None

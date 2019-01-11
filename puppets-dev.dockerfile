
# docker build -t puppets-dev -f puppets-dev.dockerfile .
# docker run --rm -it --name puppets-dev -v ${pwd}:/work puppets-dev

FROM alpine

RUN apk update && apk upgrade \
    && echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories \
    && echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories \
    && apk add --no-cache \
        nodejs-current \
        yarn \
        npm \
        chromium@edge \
        nss@edge \
        freetype@edge \
        harfbuzz@edge

RUN npm install -g nodemon jasmine

# It's a good idea to use dumb-init to help prevent zombie chrome processes.
ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init


# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV CHROME_BIN=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Puppeteer v1.4.0 works with Chromium 68.
RUN yarn add puppeteer generic-pool

COPY node-puppets.js /
WORKDIR /work


# Add user so we don't need --no-sandbox.
RUN addgroup -S pptruser && adduser -S -g pptruser pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /work

# Run everything after as non-privileged user.
USER pptruser

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "index.js"]

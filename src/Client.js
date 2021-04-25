import { ApolloClient, ApolloLink, InMemoryCache, HttpLink } from 'apollo-boost';

var httpLink = new HttpLink({ uri: 'https://ahrai.online/api' });
if (process.env.NODE_ENV == "development"){
  httpLink = new HttpLink({ uri: 'http://localhost:5000' });
}

const authLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem('token');
  operation.setContext({
    headers: {
      'Authorization': 'Bearer ' + token
    }
  });

  return forward(operation);
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
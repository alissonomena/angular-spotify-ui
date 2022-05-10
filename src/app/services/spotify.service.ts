import { Injectable } from '@angular/core';
import { SpotifyConfig } from 'src/environments/environment';
import Spotify from 'spotify-web-api-js';
import { IUsuario } from '../interfaces/IUsuario';
import { SpotifyArtistaParaArtista, SpotifyParaUser, SpotifyPlaylistParaPlaylist, SpotifySinglePlaylistParaPlaylist, SpotifyTrackParaMusica } from '../common/spotifyHelper';
import { IPlaylist } from '../interfaces/IPlaylist';
import { Router } from '@angular/router';
import { IArtista } from '../interfaces/IArtista';
import { IMusica } from '../interfaces/IMusica';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {

  spotifyApi: Spotify.SpotifyWebApiJs = null;
  usuario: IUsuario;

  constructor(
    private router: Router
  ) { 
    this.spotifyApi = new Spotify();
  }

  async initServico() {
    if(!!this.usuario)
      return true;

    const token = localStorage.getItem('token');
    if(!token)
      return false;

    try {
      this.definirAccessToken(token);
      await this.obterSpotifyUser();
      return !!this.usuario;
    } catch (er) {
      return false;
    }
  }

  async obterSpotifyUser() {
    const userInfo = await this.spotifyApi.getMe();
    this.usuario = SpotifyParaUser(userInfo);
  }

  obterUrlLogin() {
    const authEndpoit = `${SpotifyConfig.authEndpoint}?`;
    const clientId = `client_id=${SpotifyConfig.clientId}&`;
    const redirectUrl = `redirect_uri=${SpotifyConfig.redirectUrl}&`;
    const scopes = `scope=${SpotifyConfig.scopes.join('%20')}&`;
    const responseType = `response_type=token&show_dialog=true`;
    return authEndpoit + clientId + redirectUrl + scopes + responseType;
  }

  obterTokenCallback() {
    if(!window.location.hash) {
      return '';
    }

    const params = window.location.hash.substring(1).split('&');
    return params[0].split('=')[1];
  }

  definirAccessToken(token: string) {
    this.spotifyApi.setAccessToken(token);
    localStorage.setItem('token', token);
  }

  async buscarPlaylistUser(offset = 0, limit = 50): Promise<IPlaylist[]> {
    const playlists = await this.spotifyApi.getUserPlaylists(this.usuario.id, { offset, limit });
    return playlists.items.map(m => SpotifyPlaylistParaPlaylist(m));
  }

  async buscarMusicasPlaylist(playlistId: string, offset = 0, limit = 50) {
    const playlistSpotify = await this.spotifyApi.getPlaylist(playlistId);

    if(!playlistSpotify)
      return null;

    const playlist = SpotifySinglePlaylistParaPlaylist(playlistSpotify);

    const musicas = await this.spotifyApi.getPlaylistTracks(playlistId, { offset, limit });

    playlist.musicas = musicas.items.map(m => SpotifyTrackParaMusica(m.track as SpotifyApi.TrackObjectFull));
    return playlist;
  }

  async buscarTopArtistas(limit = 10): Promise<IArtista[]> {
    const artistas = await this.spotifyApi.getMyTopArtists({ limit });
    return artistas.items.map(m => SpotifyArtistaParaArtista(m));
  }

  async buscarMusicas(offset = 0, limit = 50): Promise<IMusica[]> {
    const musicas = await this.spotifyApi.getMySavedTracks({ offset, limit });
    return musicas.items.map(m => SpotifyTrackParaMusica(m.track));
  }

  async executarMusica(musicaId: string) {
    await this.spotifyApi.queue(musicaId);
    await this.spotifyApi.skipToNext();
  }

  async obterMusicaAtual(): Promise<IMusica> {
    const musica = await this.spotifyApi.getMyCurrentPlayingTrack();
    return SpotifyTrackParaMusica(musica.item);
  }

  async voltarMusica() {
    await this.spotifyApi.skipToPrevious();
  }
  
  async proximaMusica() {
    await this.spotifyApi.skipToNext();
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}

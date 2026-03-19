FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM node:20 AS frontend
WORKDIR /client
COPY sistema_triage.Client/package*.json ./
RUN npm install
COPY sistema_triage.Client/ ./
ARG VITE_API_URL=https://sistema-triage-api.onrender.com
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["sistema_triage.API/sistema_triage.API.csproj", "sistema_triage.API/"]
COPY ["sistema_triage.Application/sistema_triage.Application.csproj", "sistema_triage.Application/"]
COPY ["sistema_triage.Domain/sistema_triage.Domain.csproj", "sistema_triage.Domain/"]
COPY ["sistema_triage.Infrastructure/sistema_triage.Infrastructure.csproj", "sistema_triage.Infrastructure/"]
RUN dotnet restore "sistema_triage.API/sistema_triage.API.csproj"
COPY . .
WORKDIR "/src/sistema_triage.API"
RUN dotnet build "sistema_triage.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "sistema_triage.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
COPY --from=frontend /client/dist ./wwwroot
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "sistema_triage.API.dll"]
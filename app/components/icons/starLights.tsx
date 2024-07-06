import { twMerge } from "tailwind-merge";

export const StarLights = ({
  fill = "#5158F6",
  className = "className",
}: {
  fill?: string;
  className?: string;
}) => (
  <svg
    className={twMerge(className)}
    width="64"
    height="64"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#clip0_402_4546)">
      <mask
        id="path-1-outside-1_402_4546"
        maskUnits="userSpaceOnUse"
        x="-0.666016"
        y="7.86621"
        width="65"
        height="48"
        fill="black"
      >
        <rect fill="white" x="-0.666016" y="7.86621" width="65" height="48" />
        <path d="M51.5844 26.3683C45.0564 22.5283 42.7524 16.3843 42.1124 9.08826C42.1124 8.44826 40.4484 9.34426 40.4484 9.85626C39.8084 16.2563 39.6804 22.5283 32.5124 25.6003C30.3364 26.4963 28.4164 27.6483 26.4964 29.0563C26.2404 29.1843 25.7284 29.6963 26.2404 29.8243C28.0324 30.2083 27.3924 30.0803 29.3124 29.9523C33.6644 29.5683 35.8404 32.6403 37.6324 35.9683C39.5524 39.4243 38.7844 44.1603 40.8324 47.2323C40.9604 47.4883 41.4724 47.2323 41.6004 47.2323C43.1364 46.4643 43.3924 46.0803 43.5204 44.1603C43.7764 41.2163 44.8004 38.2723 46.0804 35.5843C48.2564 31.2323 52.6084 30.5923 56.3204 28.6723C56.4484 28.6723 57.6004 27.9043 57.0884 27.6483C55.2964 27.0083 53.5044 27.0083 51.5844 26.3683C51.0724 26.2403 49.6644 27.3923 50.0484 27.5203C51.7124 28.0323 51.3284 27.9043 52.9924 28.1603C55.5524 28.5443 51.0724 29.9523 50.6884 30.0803C49.2804 30.8483 47.3604 32.1283 46.2084 33.4083C44.5444 35.4563 43.1364 37.8883 42.6244 40.5763C42.2404 42.2403 41.6004 45.0563 41.9844 45.8243C41.0884 44.4163 41.0884 40.7043 40.7044 38.9123C39.9364 35.2003 37.5044 31.4883 34.4324 29.4403C33.6644 28.9283 32.6404 28.9283 31.7444 28.8003C28.0324 28.2883 32.2564 26.6243 33.9204 25.8563C40.7044 22.9123 41.2164 15.4883 41.9844 9.08826C41.4724 9.34426 40.8324 9.60026 40.3204 9.85626C40.9604 17.1523 43.3924 23.6803 49.9204 27.5203C50.5604 27.7763 51.9684 26.6243 51.5844 26.3683ZM24.0644 36.7363C20.4804 34.4323 19.3284 30.7203 19.0724 26.7523C18.9444 25.8563 17.4084 25.0883 17.2804 26.2403C17.0244 28.4163 16.7684 30.7203 16.2564 32.7683C15.4884 35.5843 11.1364 36.6083 9.0884 38.2723C8.3204 38.9123 9.0884 39.8083 9.8564 39.8083C13.8244 40.1923 15.3604 41.4723 16.6404 45.3123C17.1524 46.8483 16.7684 48.7683 17.6644 50.1763C17.9204 50.6883 18.4324 51.0723 19.0724 50.6883C20.2244 50.1763 20.0964 48.5123 20.2244 47.3603C20.9924 42.6243 23.6804 40.9603 27.7764 39.0403C28.5444 38.6563 27.6484 37.6323 27.2644 37.5043C25.8564 36.9923 25.7284 37.1203 23.9364 36.6083C22.7844 36.2243 22.9124 37.8883 23.8084 38.2723C24.7044 38.5283 26.3684 38.9123 27.1364 39.1683C27.0084 38.6563 26.7524 38.1443 26.6244 37.6323C24.0644 38.7843 21.8884 39.5523 20.2244 41.9843C19.4564 43.0083 18.6884 48.8963 17.9204 49.2803C18.4324 49.4083 18.8164 49.6643 19.3284 49.7923C17.7924 47.3603 18.4324 43.9043 16.7684 41.3443C14.7204 38.1443 13.0564 38.4003 9.6004 38.0163C9.7284 38.6563 9.9844 39.1683 10.2404 39.6803C12.5444 37.8883 15.1044 37.1203 17.1524 34.9443C18.8164 33.1523 18.8164 29.0563 19.0724 26.7523C18.4324 26.6243 17.9204 26.3683 17.2804 26.2403C17.6644 31.2323 19.2004 35.3283 23.5524 38.1443C24.5764 38.7843 24.9604 37.3763 24.0644 36.7363ZM10.4964 18.1763C12.5444 18.1763 14.5924 18.1763 16.6404 18.1763C17.5364 18.1763 18.5604 16.8963 17.2804 16.8963C15.2324 16.8963 13.1844 16.8963 11.1364 16.8963C10.2404 16.8963 9.2164 18.1763 10.4964 18.1763ZM15.7444 13.3123C16.7684 13.3123 17.6644 13.3123 18.6884 13.3123C18.8164 13.3123 19.5844 13.1843 19.3284 12.9283C19.0724 12.6723 18.4324 12.6723 18.1764 12.6723C17.1524 12.6723 16.2564 12.6723 15.2324 12.6723C15.1044 12.6723 14.3364 12.8003 14.5924 13.0563C14.8484 13.3123 15.4884 13.3123 15.7444 13.3123ZM22.1444 16.0003C23.9364 16.0003 25.8564 16.0003 27.6484 16.0003C28.0324 16.0003 28.5444 15.7443 28.8004 15.4883C28.9284 15.3603 29.3124 15.1043 28.9284 15.1043C27.1364 15.1043 25.2164 15.1043 23.4244 15.1043C23.0404 15.1043 22.5284 15.3603 22.2724 15.6163C22.1444 15.7443 21.7604 16.0003 22.1444 16.0003ZM19.2004 20.0963C20.0964 20.0963 21.1204 20.0963 22.0164 20.0963C22.9124 20.0963 23.8084 18.8163 22.5284 18.8163C21.6324 18.8163 20.6084 18.8163 19.7124 18.8163C18.8164 18.8163 17.9204 20.0963 19.2004 20.0963ZM5.1204 32.2563C6.0164 32.2563 6.9124 32.2563 7.8084 32.2563C7.9364 32.2563 8.7044 32.1283 8.4484 31.8723C8.1924 31.6163 7.5524 31.6163 7.2964 31.6163C6.4004 31.6163 5.5044 31.6163 4.6084 31.6163C4.4804 31.6163 3.7124 31.7443 3.9684 32.0003C4.0964 32.2563 4.7364 32.2563 5.1204 32.2563ZM1.7924 36.2243C2.9444 36.2243 3.9684 36.2243 5.1204 36.2243C5.5044 36.2243 5.5044 35.9683 5.2484 35.7123C4.8644 35.4563 4.3524 35.3283 3.9684 35.3283C2.8164 35.3283 1.7924 35.3283 0.640401 35.3283C0.256401 35.3283 0.256401 35.5843 0.512401 35.8403C0.896401 36.0963 1.4084 36.2243 1.7924 36.2243ZM24.8324 47.4883C25.7284 47.4883 26.4964 47.4883 27.3924 47.4883C28.4164 47.4883 28.8004 45.8243 27.6484 45.8243C26.7524 45.8243 25.9844 45.8243 25.0884 45.8243C23.9364 45.8243 23.5524 47.4883 24.8324 47.4883ZM28.1604 51.3283C29.8244 51.3283 31.4884 51.3283 33.1524 51.3283C33.5364 51.3283 34.0484 51.3283 34.4324 50.9443C34.6884 50.6883 34.1764 50.5603 34.0484 50.5603C32.3844 50.5603 30.7204 50.5603 29.0564 50.5603C28.6724 50.5603 28.1604 50.5603 27.7764 50.9443C27.3924 51.2003 27.9044 51.3283 28.1604 51.3283ZM22.6564 55.2963C23.8084 55.2963 24.9604 55.2963 25.9844 55.2963C26.4964 55.2963 27.0084 55.0403 27.1364 54.5283C27.2644 54.0163 26.8804 53.6323 26.3684 53.6323C25.2164 53.6323 24.0644 53.6323 23.0404 53.6323C22.5284 53.6323 22.0164 53.8883 21.8884 54.4003C21.8884 54.9123 22.2724 55.2963 22.6564 55.2963ZM47.4884 47.6163C48.3844 47.6163 49.2804 47.6163 50.3044 47.6163C50.6884 47.6163 51.2004 47.6163 51.5844 47.4883C51.9684 47.3603 51.3284 47.3603 51.2004 47.3603C50.3044 47.3603 49.4084 47.3603 48.3844 47.3603C48.0004 47.3603 47.4884 47.3603 47.1044 47.4883C46.7204 47.4883 47.3604 47.6163 47.4884 47.6163ZM52.9924 44.8003C54.9124 44.8003 56.8324 44.8003 58.7524 44.8003C59.6484 44.8003 59.0084 43.0083 58.2404 43.0083C56.3204 43.0083 54.4004 43.0083 52.4804 43.0083C51.5844 43.0083 52.2244 44.8003 52.9924 44.8003ZM50.5604 41.4723C51.8404 41.4723 53.1204 41.4723 54.4004 41.4723C54.5284 41.4723 53.8884 41.0883 53.8884 41.0883C53.6324 40.9603 53.1204 40.7043 52.7364 40.7043C51.4564 40.7043 50.1764 40.7043 48.8964 40.7043C48.7684 40.7043 49.4084 41.0883 49.4084 41.0883C49.7924 41.2163 50.1764 41.4723 50.5604 41.4723ZM60.2884 40.7043C61.1844 40.7043 62.0804 40.7043 63.1044 40.7043C64.2564 40.7043 63.3604 39.1683 62.5924 39.1683C61.6964 39.1683 60.8004 39.1683 59.7764 39.1683C58.4964 39.1683 59.3924 40.7043 60.2884 40.7043ZM57.7284 23.4243C58.7524 23.4243 59.7764 23.4243 60.8004 23.4243C61.1844 23.4243 61.3124 23.1683 60.9284 23.0403C60.5444 22.7843 60.0324 22.5283 59.6484 22.5283C58.6244 22.5283 57.6004 22.5283 56.5764 22.5283C56.1924 22.5283 56.0644 22.7843 56.4484 22.9123C56.8324 23.1683 57.3444 23.4243 57.7284 23.4243Z" />
      </mask>
      <path
        d="M51.5844 26.3683C45.0564 22.5283 42.7524 16.3843 42.1124 9.08826C42.1124 8.44826 40.4484 9.34426 40.4484 9.85626C39.8084 16.2563 39.6804 22.5283 32.5124 25.6003C30.3364 26.4963 28.4164 27.6483 26.4964 29.0563C26.2404 29.1843 25.7284 29.6963 26.2404 29.8243C28.0324 30.2083 27.3924 30.0803 29.3124 29.9523C33.6644 29.5683 35.8404 32.6403 37.6324 35.9683C39.5524 39.4243 38.7844 44.1603 40.8324 47.2323C40.9604 47.4883 41.4724 47.2323 41.6004 47.2323C43.1364 46.4643 43.3924 46.0803 43.5204 44.1603C43.7764 41.2163 44.8004 38.2723 46.0804 35.5843C48.2564 31.2323 52.6084 30.5923 56.3204 28.6723C56.4484 28.6723 57.6004 27.9043 57.0884 27.6483C55.2964 27.0083 53.5044 27.0083 51.5844 26.3683C51.0724 26.2403 49.6644 27.3923 50.0484 27.5203C51.7124 28.0323 51.3284 27.9043 52.9924 28.1603C55.5524 28.5443 51.0724 29.9523 50.6884 30.0803C49.2804 30.8483 47.3604 32.1283 46.2084 33.4083C44.5444 35.4563 43.1364 37.8883 42.6244 40.5763C42.2404 42.2403 41.6004 45.0563 41.9844 45.8243C41.0884 44.4163 41.0884 40.7043 40.7044 38.9123C39.9364 35.2003 37.5044 31.4883 34.4324 29.4403C33.6644 28.9283 32.6404 28.9283 31.7444 28.8003C28.0324 28.2883 32.2564 26.6243 33.9204 25.8563C40.7044 22.9123 41.2164 15.4883 41.9844 9.08826C41.4724 9.34426 40.8324 9.60026 40.3204 9.85626C40.9604 17.1523 43.3924 23.6803 49.9204 27.5203C50.5604 27.7763 51.9684 26.6243 51.5844 26.3683ZM24.0644 36.7363C20.4804 34.4323 19.3284 30.7203 19.0724 26.7523C18.9444 25.8563 17.4084 25.0883 17.2804 26.2403C17.0244 28.4163 16.7684 30.7203 16.2564 32.7683C15.4884 35.5843 11.1364 36.6083 9.0884 38.2723C8.3204 38.9123 9.0884 39.8083 9.8564 39.8083C13.8244 40.1923 15.3604 41.4723 16.6404 45.3123C17.1524 46.8483 16.7684 48.7683 17.6644 50.1763C17.9204 50.6883 18.4324 51.0723 19.0724 50.6883C20.2244 50.1763 20.0964 48.5123 20.2244 47.3603C20.9924 42.6243 23.6804 40.9603 27.7764 39.0403C28.5444 38.6563 27.6484 37.6323 27.2644 37.5043C25.8564 36.9923 25.7284 37.1203 23.9364 36.6083C22.7844 36.2243 22.9124 37.8883 23.8084 38.2723C24.7044 38.5283 26.3684 38.9123 27.1364 39.1683C27.0084 38.6563 26.7524 38.1443 26.6244 37.6323C24.0644 38.7843 21.8884 39.5523 20.2244 41.9843C19.4564 43.0083 18.6884 48.8963 17.9204 49.2803C18.4324 49.4083 18.8164 49.6643 19.3284 49.7923C17.7924 47.3603 18.4324 43.9043 16.7684 41.3443C14.7204 38.1443 13.0564 38.4003 9.6004 38.0163C9.7284 38.6563 9.9844 39.1683 10.2404 39.6803C12.5444 37.8883 15.1044 37.1203 17.1524 34.9443C18.8164 33.1523 18.8164 29.0563 19.0724 26.7523C18.4324 26.6243 17.9204 26.3683 17.2804 26.2403C17.6644 31.2323 19.2004 35.3283 23.5524 38.1443C24.5764 38.7843 24.9604 37.3763 24.0644 36.7363ZM10.4964 18.1763C12.5444 18.1763 14.5924 18.1763 16.6404 18.1763C17.5364 18.1763 18.5604 16.8963 17.2804 16.8963C15.2324 16.8963 13.1844 16.8963 11.1364 16.8963C10.2404 16.8963 9.2164 18.1763 10.4964 18.1763ZM15.7444 13.3123C16.7684 13.3123 17.6644 13.3123 18.6884 13.3123C18.8164 13.3123 19.5844 13.1843 19.3284 12.9283C19.0724 12.6723 18.4324 12.6723 18.1764 12.6723C17.1524 12.6723 16.2564 12.6723 15.2324 12.6723C15.1044 12.6723 14.3364 12.8003 14.5924 13.0563C14.8484 13.3123 15.4884 13.3123 15.7444 13.3123ZM22.1444 16.0003C23.9364 16.0003 25.8564 16.0003 27.6484 16.0003C28.0324 16.0003 28.5444 15.7443 28.8004 15.4883C28.9284 15.3603 29.3124 15.1043 28.9284 15.1043C27.1364 15.1043 25.2164 15.1043 23.4244 15.1043C23.0404 15.1043 22.5284 15.3603 22.2724 15.6163C22.1444 15.7443 21.7604 16.0003 22.1444 16.0003ZM19.2004 20.0963C20.0964 20.0963 21.1204 20.0963 22.0164 20.0963C22.9124 20.0963 23.8084 18.8163 22.5284 18.8163C21.6324 18.8163 20.6084 18.8163 19.7124 18.8163C18.8164 18.8163 17.9204 20.0963 19.2004 20.0963ZM5.1204 32.2563C6.0164 32.2563 6.9124 32.2563 7.8084 32.2563C7.9364 32.2563 8.7044 32.1283 8.4484 31.8723C8.1924 31.6163 7.5524 31.6163 7.2964 31.6163C6.4004 31.6163 5.5044 31.6163 4.6084 31.6163C4.4804 31.6163 3.7124 31.7443 3.9684 32.0003C4.0964 32.2563 4.7364 32.2563 5.1204 32.2563ZM1.7924 36.2243C2.9444 36.2243 3.9684 36.2243 5.1204 36.2243C5.5044 36.2243 5.5044 35.9683 5.2484 35.7123C4.8644 35.4563 4.3524 35.3283 3.9684 35.3283C2.8164 35.3283 1.7924 35.3283 0.640401 35.3283C0.256401 35.3283 0.256401 35.5843 0.512401 35.8403C0.896401 36.0963 1.4084 36.2243 1.7924 36.2243ZM24.8324 47.4883C25.7284 47.4883 26.4964 47.4883 27.3924 47.4883C28.4164 47.4883 28.8004 45.8243 27.6484 45.8243C26.7524 45.8243 25.9844 45.8243 25.0884 45.8243C23.9364 45.8243 23.5524 47.4883 24.8324 47.4883ZM28.1604 51.3283C29.8244 51.3283 31.4884 51.3283 33.1524 51.3283C33.5364 51.3283 34.0484 51.3283 34.4324 50.9443C34.6884 50.6883 34.1764 50.5603 34.0484 50.5603C32.3844 50.5603 30.7204 50.5603 29.0564 50.5603C28.6724 50.5603 28.1604 50.5603 27.7764 50.9443C27.3924 51.2003 27.9044 51.3283 28.1604 51.3283ZM22.6564 55.2963C23.8084 55.2963 24.9604 55.2963 25.9844 55.2963C26.4964 55.2963 27.0084 55.0403 27.1364 54.5283C27.2644 54.0163 26.8804 53.6323 26.3684 53.6323C25.2164 53.6323 24.0644 53.6323 23.0404 53.6323C22.5284 53.6323 22.0164 53.8883 21.8884 54.4003C21.8884 54.9123 22.2724 55.2963 22.6564 55.2963ZM47.4884 47.6163C48.3844 47.6163 49.2804 47.6163 50.3044 47.6163C50.6884 47.6163 51.2004 47.6163 51.5844 47.4883C51.9684 47.3603 51.3284 47.3603 51.2004 47.3603C50.3044 47.3603 49.4084 47.3603 48.3844 47.3603C48.0004 47.3603 47.4884 47.3603 47.1044 47.4883C46.7204 47.4883 47.3604 47.6163 47.4884 47.6163ZM52.9924 44.8003C54.9124 44.8003 56.8324 44.8003 58.7524 44.8003C59.6484 44.8003 59.0084 43.0083 58.2404 43.0083C56.3204 43.0083 54.4004 43.0083 52.4804 43.0083C51.5844 43.0083 52.2244 44.8003 52.9924 44.8003ZM50.5604 41.4723C51.8404 41.4723 53.1204 41.4723 54.4004 41.4723C54.5284 41.4723 53.8884 41.0883 53.8884 41.0883C53.6324 40.9603 53.1204 40.7043 52.7364 40.7043C51.4564 40.7043 50.1764 40.7043 48.8964 40.7043C48.7684 40.7043 49.4084 41.0883 49.4084 41.0883C49.7924 41.2163 50.1764 41.4723 50.5604 41.4723ZM60.2884 40.7043C61.1844 40.7043 62.0804 40.7043 63.1044 40.7043C64.2564 40.7043 63.3604 39.1683 62.5924 39.1683C61.6964 39.1683 60.8004 39.1683 59.7764 39.1683C58.4964 39.1683 59.3924 40.7043 60.2884 40.7043ZM57.7284 23.4243C58.7524 23.4243 59.7764 23.4243 60.8004 23.4243C61.1844 23.4243 61.3124 23.1683 60.9284 23.0403C60.5444 22.7843 60.0324 22.5283 59.6484 22.5283C58.6244 22.5283 57.6004 22.5283 56.5764 22.5283C56.1924 22.5283 56.0644 22.7843 56.4484 22.9123C56.8324 23.1683 57.3444 23.4243 57.7284 23.4243Z"
        fill={fill}
      />
      <path
        d="M50.5601 19.3278C52.6081 19.3278 54.5281 19.3278 56.5761 19.3278C56.5761 19.3278 56.1921 17.6638 55.6801 17.6638C53.6321 17.6638 51.7121 17.6638 49.6641 17.6638C49.6641 17.5358 50.0481 19.3278 50.5601 19.3278Z"
        fill={fill}
      />
    </g>
    <defs>
      <clipPath id="clip0_402_4546">
        <rect width="64" height="64" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

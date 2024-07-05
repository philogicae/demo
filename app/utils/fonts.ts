import localFont from 'next/font/local'

const RigidSquare = localFont({
  variable: '--font-rigid-square',
  preload: true,
  src: [
    {
      path: '../fonts/RigidSquare/RigidSquare-Thin.otf',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../fonts/RigidSquare/RigidSquare-Thin-italic.otf',
      weight: '100',
      style: 'italic',
    },
    {
      path: '../fonts/RigidSquare/RigidSquare-ExtraLight.otf',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../fonts/RigidSquare/RigidSquare-ExtraLight-italic.otf',
      weight: '200',
      style: 'italic',
    },
    {
      path: '../fonts/RigidSquare/RigidSquare-Light.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../fonts/RigidSquare/RigidSquare-Light-italic.otf',
      weight: '300',
      style: 'italic',
    },
    {
      path: '../fonts/RigidSquare/RigidSquare-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/RigidSquare/RigidSquare-Regular-italic.otf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../fonts/RigidSquare/RigidSquare-SemiBold.otf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../fonts/RigidSquare/RigidSquare-SemiBold-italic.otf',
      weight: '600',
      style: 'italic',
    },
    {
      path: '../fonts/RigidSquare/RigidSquare-Bold.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../fonts/RigidSquare/RigidSquare-Bold-italic.otf',
      weight: '700',
      style: 'italic',
    },
    {
      path: '../fonts/RigidSquare/RigidSquare-ExtraBold.otf',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../fonts/RigidSquare/RigidSquare-ExtraBold-italic.otf',
      weight: '800',
      style: 'italic',
    },
  ],
})

export default RigidSquare
